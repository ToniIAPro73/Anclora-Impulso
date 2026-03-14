#!/usr/bin/env python3
"""
=============================================================================
ANCLORA IMPULSO — Generador de Imágenes de Ejercicios
=============================================================================
Script híbrido: descarga imágenes de wger.de (CC-BY-SA) y genera las
faltantes con Hugging Face Inference API (FLUX/Z-Image).

REQUISITOS:
    pip install requests Pillow huggingface_hub

USO:
    python exercise_image_generator.py --step 1   # Descargar catálogo wger
    python exercise_image_generator.py --step 2   # Mapear contra ejercicios
    python exercise_image_generator.py --step 3   # Generar faltantes con IA
    python exercise_image_generator.py --step all  # Ejecutar todo

CONFIGURACIÓN:
    - Coloca tu exercises.json en el mismo directorio
    - Configura HF_TOKEN con tu token de Hugging Face (opcional para mayor cuota)
=============================================================================
"""

import json
import os
import sys
import time
import argparse
import re
from pathlib import Path
from typing import Optional

import requests
from PIL import Image
from io import BytesIO

# =============================================================================
# CONFIGURACIÓN
# =============================================================================

BASE_DIR = Path(__file__).parent
EXERCISES_JSON = BASE_DIR / "exercises.json"
OUTPUT_DIR = BASE_DIR / "exercise_images"
WGER_CACHE_DIR = BASE_DIR / "wger_cache"
MAPPING_FILE = BASE_DIR / "exercise_mapping.json"
REPORT_FILE = BASE_DIR / "generation_report.json"

# Hugging Face
HF_TOKEN = os.environ.get("HF_TOKEN", "")
HF_MODEL = "black-forest-labs/FLUX.1-schnell"  # Rápido y gratuito
HF_API_URL = f"https://api-inference.huggingface.co/models/{HF_MODEL}"

# Prompt base para generación consistente
PROMPT_TEMPLATE = (
    "Professional fitness exercise illustration, {exercise_description}, "
    "{position} position, athletic muscular figure, clean white background, "
    "exercise guide diagram style, full body visible, anatomical accuracy, "
    "clean lines, no text, no watermark, high contrast, vector illustration style"
)

# Wger API
WGER_API_BASE = "https://wger.de/api/v2"
WGER_EXERCISE_URL = f"{WGER_API_BASE}/exercise/?format=json&language=2&limit=200"
WGER_EXERCISE_INFO_URL = f"{WGER_API_BASE}/exerciseinfo/{{id}}/?format=json"
WGER_IMAGE_LIST_URL = f"{WGER_API_BASE}/exerciseimage/?format=json&limit=300"


# =============================================================================
# MAPEO DE NOMBRES: Anclora Impulso → wger
# =============================================================================
# Mapeo manual de nombres de ejercicios entre tu JSON y los nombres en wger.
# wger usa nombres en inglés. Este diccionario mapea los nombres exactos de
# tu exercises.json a los nombres o IDs en wger.

MANUAL_NAME_MAP = {
    # Chest
    "Bench Press": ["Bench Press", "Barbell Bench Press"],
    "Incline Bench Press": ["Incline Barbell Bench Press", "Incline Bench Press"],
    "Decline Bench Press": ["Decline Bench Press"],
    "Dumbbell Bench Press": ["Dumbbell Bench Press"],
    "Dumbbell Flyes": ["Dumbbell Flyes", "Flyes With Dumbbells"],
    "Incline Dumbbell Press": ["Incline Dumbbell Press"],
    "Push-ups": ["Push Ups", "Pushups"],
    "Cable Crossover": ["Cable Crossover"],
    "Chest Dips": ["Dips"],
    "Diamond Push-ups": ["Diamond Push Ups", "Narrow Grip Pushups"],
    "Wide Grip Push-ups": ["Wide Grip Pushups", "Wide Push Ups"],
    "Landmine Press": ["Landmine Press"],

    # Back
    "Deadlifts": ["Deadlift", "Deadlifts"],
    "Bent Over Rows": ["Bent Over Barbell Row", "Barbell Rows"],
    "Pull-ups": ["Pull Ups", "Pullups"],
    "Chin-ups": ["Chin Ups", "Chinups"],
    "Lat Pulldowns": ["Lat Pulldown", "Wide Grip Lat Pulldown"],
    "Seated Cable Rows": ["Seated Cable Row", "Seated Row"],
    "T-Bar Row": ["T-Bar Row"],
    "Single Arm Dumbbell Row": ["One Arm Dumbbell Row", "Dumbbell Row"],
    "Dumbbell Rows": ["Dumbbell Row"],
    "Inverted Rows": ["Inverted Row"],
    "Hyperextensions": ["Hyperextension", "Back Extension"],

    # Legs
    "Squats": ["Squat", "Bodyweight Squat"],
    "Barbell Squats": ["Barbell Squat", "Back Squat"],
    "Front Squats": ["Front Squat", "Front Barbell Squat"],
    "Leg Press": ["Leg Press"],
    "Leg Extensions": ["Leg Extension"],
    "Leg Curls": ["Leg Curl", "Lying Leg Curl"],
    "Romanian Deadlifts": ["Romanian Deadlift", "Stiff Leg Deadlift"],
    "Bulgarian Split Squats": ["Bulgarian Split Squat"],
    "Lunges": ["Lunge", "Lunges"],
    "Walking Lunges": ["Walking Lunge"],
    "Calf Raises": ["Calf Raise", "Standing Calf Raise"],
    "Hip Thrusts": ["Hip Thrust", "Barbell Hip Thrust"],
    "Glute Bridges": ["Glute Bridge"],
    "Goblet Squats": ["Goblet Squat"],

    # Arms
    "Bicep Curls": ["Bicep Curl", "Dumbbell Curl", "Dumbbell Bicep Curl"],
    "Barbell Curls": ["Barbell Curl", "Barbell Bicep Curl"],
    "Hammer Curls": ["Hammer Curl", "Hammer Curls"],
    "Tricep Pushdowns": ["Tricep Pushdown", "Cable Pushdown"],
    "Tricep Dips": ["Bench Dips", "Tricep Dip"],
    "Skull Crushers": ["Skull Crusher", "Lying Tricep Extension"],
    "Overhead Tricep Extension": ["Overhead Tricep Extension"],
    "Close Grip Bench Press": ["Close Grip Bench Press"],

    # Shoulders
    "Shoulder Press": ["Shoulder Press", "Dumbbell Shoulder Press"],
    "Overhead Press": ["Overhead Press", "Military Press"],
    "Military Press": ["Military Press", "Standing Barbell Press"],
    "Lateral Raises": ["Lateral Raise", "Side Lateral Raise"],
    "Front Raises": ["Front Raise", "Dumbbell Front Raise"],
    "Arnold Press": ["Arnold Press"],
    "Face Pulls": ["Face Pull"],
    "Shrugs": ["Shrug", "Dumbbell Shrug"],
    "Upright Rows": ["Upright Row", "Barbell Upright Row"],

    # Core
    "Plank": ["Plank", "Front Plank"],
    "Crunches": ["Crunches", "Crunch"],
    "Leg Raises": ["Leg Raise", "Lying Leg Raise"],
    "Russian Twists": ["Russian Twist"],
    "Mountain Climbers": ["Mountain Climber"],
    "Bicycle Crunches": ["Bicycle Crunch"],

    # Cardio
    "Burpees": ["Burpee", "Burpees"],
    "Jumping Jacks": ["Jumping Jack", "Jumping Jacks"],
    "Box Jumps": ["Box Jump"],
    "High Knees": ["High Knees"],
    "Jump Rope": ["Jump Rope", "Skipping"],
    "Kettlebell Swings": ["Kettlebell Swing"],
}

# Descripciones de pose para generación IA (start/end)
POSE_DESCRIPTIONS = {
    # Formato: "exercise_name": ("start_description", "end_description")
    "Barbell Curls": (
        "standing upright holding barbell with arms fully extended at thigh level",
        "standing upright with barbell curled up to shoulder height, biceps flexed"
    ),
    "Bench Press": (
        "lying on bench with barbell lowered to chest, arms bent at 90 degrees",
        "lying on bench pressing barbell up with arms fully extended"
    ),
    "Squats": (
        "standing upright with feet shoulder width apart",
        "in deep squat position with thighs parallel to ground, knees bent"
    ),
    "Deadlifts": (
        "bent over gripping barbell on the ground, back straight, hips hinged",
        "standing upright holding barbell at hip level, fully extended"
    ),
    "Pull-ups": (
        "hanging from pull-up bar with arms fully extended",
        "chin above the bar with arms fully flexed"
    ),
    "Shoulder Press": (
        "seated holding dumbbells at shoulder height",
        "pressing dumbbells overhead with arms fully extended"
    ),
    "Plank": (
        "in forearm plank position, body straight, core engaged",
        "in forearm plank position, body straight, core engaged"
    ),
    "Lunges": (
        "standing upright with feet together",
        "in lunge position with front knee bent at 90 degrees, back knee near ground"
    ),
    "Bicep Curls": (
        "standing holding dumbbells with arms extended at sides",
        "standing with dumbbells curled up to shoulders, biceps contracted"
    ),
    "Lateral Raises": (
        "standing with dumbbells at sides, arms relaxed",
        "standing with arms raised laterally to shoulder height"
    ),
    "Crunches": (
        "lying on back with knees bent, hands behind head",
        "upper back lifted off ground, abs contracted"
    ),
    "Push-ups": (
        "in push-up position with arms extended, body straight",
        "lowered to ground with chest near floor, arms bent"
    ),
    "Bent Over Rows": (
        "bent forward at hips holding barbell with arms extended",
        "pulling barbell to lower abdomen, elbows back"
    ),
    "Leg Press": (
        "seated in leg press machine with legs extended on platform",
        "knees bent at 90 degrees pressing weight plate"
    ),
    "Tricep Dips": (
        "supporting body on parallel bars with arms extended",
        "lowered with elbows bent at 90 degrees"
    ),
}


# =============================================================================
# PASO 1: Descargar catálogo de wger
# =============================================================================

def step1_download_wger_catalog():
    """Descarga el catálogo completo de ejercicios e imágenes de wger.de"""
    print("=" * 60)
    print("PASO 1: Descargando catálogo de wger.de")
    print("=" * 60)

    WGER_CACHE_DIR.mkdir(exist_ok=True)

    # 1.1 Descargar lista de ejercicios
    print("\n[1.1] Descargando lista de ejercicios...")
    exercises = []
    url = f"{WGER_API_BASE}/exercise/?format=json&language=2&limit=100&offset=0"
    while url:
        try:
            resp = requests.get(url, timeout=30)
            resp.raise_for_status()
            data = resp.json()
            exercises.extend(data.get("results", []))
            url = data.get("next")
            print(f"  → {len(exercises)} ejercicios descargados...")
            time.sleep(0.5)  # Rate limiting
        except Exception as e:
            print(f"  ✗ Error: {e}")
            break

    wger_exercises_file = WGER_CACHE_DIR / "wger_exercises.json"
    with open(wger_exercises_file, "w", encoding="utf-8") as f:
        json.dump(exercises, f, indent=2, ensure_ascii=False)
    print(f"  ✓ {len(exercises)} ejercicios guardados en {wger_exercises_file}")

    # 1.2 Descargar lista de imágenes
    print("\n[1.2] Descargando lista de imágenes...")
    images = []
    url = f"{WGER_API_BASE}/exerciseimage/?format=json&limit=100&offset=0"
    while url:
        try:
            resp = requests.get(url, timeout=30)
            resp.raise_for_status()
            data = resp.json()
            images.extend(data.get("results", []))
            url = data.get("next")
            print(f"  → {len(images)} imágenes indexadas...")
            time.sleep(0.5)
        except Exception as e:
            print(f"  ✗ Error: {e}")
            break

    wger_images_file = WGER_CACHE_DIR / "wger_images.json"
    with open(wger_images_file, "w", encoding="utf-8") as f:
        json.dump(images, f, indent=2, ensure_ascii=False)
    print(f"  ✓ {len(images)} imágenes indexadas en {wger_images_file}")

    # 1.3 Descargar exerciseinfo (incluye nombres traducidos)
    print("\n[1.3] Descargando info detallada de ejercicios con imágenes...")
    exercise_ids_with_images = set(img["exercise"] for img in images)
    exercise_infos = []

    for i, ex_id in enumerate(exercise_ids_with_images):
        try:
            url = f"{WGER_API_BASE}/exerciseinfo/{ex_id}/?format=json"
            resp = requests.get(url, timeout=30)
            resp.raise_for_status()
            info = resp.json()
            exercise_infos.append(info)
            if (i + 1) % 10 == 0:
                print(f"  → {i+1}/{len(exercise_ids_with_images)} ejercicios procesados...")
            time.sleep(0.3)
        except Exception as e:
            print(f"  ✗ Error en ejercicio {ex_id}: {e}")

    wger_info_file = WGER_CACHE_DIR / "wger_exercise_info.json"
    with open(wger_info_file, "w", encoding="utf-8") as f:
        json.dump(exercise_infos, f, indent=2, ensure_ascii=False)
    print(f"  ✓ {len(exercise_infos)} ejercicios con info detallada guardados")

    print(f"\nPASO 1 COMPLETADO")
    print(f"  Ejercicios en wger: {len(exercises)}")
    print(f"  Imágenes disponibles: {len(images)}")
    print(f"  Ejercicios con imágenes: {len(exercise_ids_with_images)}")


# =============================================================================
# PASO 2: Mapear ejercicios Anclora → wger
# =============================================================================

def normalize_name(name: str) -> str:
    """Normaliza un nombre de ejercicio para matching"""
    name = name.lower().strip()
    name = re.sub(r'[^a-z0-9\s]', '', name)
    name = re.sub(r'\s+', ' ', name)
    return name


def step2_map_exercises():
    """Mapea los 105 ejercicios de Anclora contra el catálogo wger"""
    print("=" * 60)
    print("PASO 2: Mapeando ejercicios Anclora → wger")
    print("=" * 60)

    # Cargar ejercicios Anclora
    with open(EXERCISES_JSON, "r", encoding="utf-8") as f:
        anclora_exercises = json.load(f)
    print(f"  Ejercicios Anclora: {len(anclora_exercises)}")

    # Cargar catálogo wger
    wger_info_file = WGER_CACHE_DIR / "wger_exercise_info.json"
    wger_images_file = WGER_CACHE_DIR / "wger_images.json"

    if not wger_info_file.exists() or not wger_images_file.exists():
        print("  ✗ Ejecuta --step 1 primero")
        return

    with open(wger_info_file, "r", encoding="utf-8") as f:
        wger_infos = json.load(f)
    with open(wger_images_file, "r", encoding="utf-8") as f:
        wger_images = json.load(f)

    # Construir índice wger: nombre → exercise_id → imágenes
    wger_name_index = {}
    for info in wger_infos:
        ex_id = info.get("id")
        names = []
        for trans in info.get("translations", []):
            name = trans.get("name", "")
            if name:
                names.append(name)
        for alias in info.get("aliases", []):
            a = alias.get("alias", "")
            if a:
                names.append(a)

        for name in names:
            norm = normalize_name(name)
            wger_name_index[norm] = ex_id

    # Construir índice: exercise_id → [image_urls]
    wger_image_index = {}
    for img in wger_images:
        ex_id = img["exercise"]
        if ex_id not in wger_image_index:
            wger_image_index[ex_id] = []
        wger_image_index[ex_id].append({
            "url": img["image"],
            "is_main": img["is_main"],
            "id": img["id"]
        })

    # Mapear cada ejercicio Anclora
    mapping = []
    matched = 0
    unmatched = 0

    for ex in anclora_exercises:
        name = ex["name"]
        result = {
            "anclora_id": ex["id"],
            "anclora_name": name,
            "muscle_group": ex["muscleGroup"],
            "equipment": ex["equipment"],
            "wger_match": None,
            "wger_images": [],
            "source": "none",
            "needs_generation": True
        }

        # Intentar match por MANUAL_NAME_MAP primero
        found = False
        if name in MANUAL_NAME_MAP:
            for candidate in MANUAL_NAME_MAP[name]:
                norm = normalize_name(candidate)
                if norm in wger_name_index:
                    wger_id = wger_name_index[norm]
                    images = wger_image_index.get(wger_id, [])
                    if images:
                        result["wger_match"] = wger_id
                        result["wger_images"] = images
                        result["source"] = "wger"
                        result["needs_generation"] = False
                        found = True
                        break

        # Fallback: fuzzy match por nombre normalizado
        if not found:
            norm_name = normalize_name(name)
            if norm_name in wger_name_index:
                wger_id = wger_name_index[norm_name]
                images = wger_image_index.get(wger_id, [])
                if images:
                    result["wger_match"] = wger_id
                    result["wger_images"] = images
                    result["source"] = "wger"
                    result["needs_generation"] = False
                    found = True

        if found:
            matched += 1
        else:
            unmatched += 1

        mapping.append(result)

    # Guardar mapping
    with open(MAPPING_FILE, "w", encoding="utf-8") as f:
        json.dump(mapping, f, indent=2, ensure_ascii=False)

    print(f"\n  RESULTADO DEL MAPEO:")
    print(f"  ✓ Con imágenes de wger: {matched}")
    print(f"  ✗ Sin imágenes (requieren IA): {unmatched}")
    print(f"\n  Ejercicios sin imagen:")
    for m in mapping:
        if m["needs_generation"]:
            print(f"    - {m['anclora_name']} ({m['muscle_group']} / {m['equipment']})")

    print(f"\n  Mapping guardado en {MAPPING_FILE}")


# =============================================================================
# PASO 3: Descargar wger + Generar faltantes con IA
# =============================================================================

def download_wger_image(url: str, save_path: Path) -> bool:
    """Descarga una imagen de wger"""
    try:
        resp = requests.get(url, timeout=30)
        resp.raise_for_status()
        img = Image.open(BytesIO(resp.content))
        # Guardar como PNG con fondo transparente si es posible
        img.save(save_path, "PNG")
        return True
    except Exception as e:
        print(f"    ✗ Error descargando {url}: {e}")
        return False


def generate_with_hf(prompt: str, save_path: Path, seed: int = 42) -> bool:
    """Genera una imagen con Hugging Face Inference API"""
    headers = {}
    if HF_TOKEN:
        headers["Authorization"] = f"Bearer {HF_TOKEN}"

    payload = {"inputs": prompt}

    try:
        resp = requests.post(HF_API_URL, headers=headers, json=payload, timeout=120)

        if resp.status_code == 503:
            # Modelo cargándose
            print("    ⏳ Modelo cargándose, esperando 30s...")
            time.sleep(30)
            resp = requests.post(HF_API_URL, headers=headers, json=payload, timeout=120)

        if resp.status_code == 429:
            print("    ⏳ Rate limit, esperando 60s...")
            time.sleep(60)
            resp = requests.post(HF_API_URL, headers=headers, json=payload, timeout=120)

        resp.raise_for_status()

        img = Image.open(BytesIO(resp.content))
        img.save(save_path, "PNG")
        return True

    except Exception as e:
        print(f"    ✗ Error generando: {e}")
        return False


def get_pose_description(exercise_name: str, position: str) -> str:
    """Obtiene la descripción de pose para un ejercicio"""
    if exercise_name in POSE_DESCRIPTIONS:
        start, end = POSE_DESCRIPTIONS[exercise_name]
        return start if position == "start" else end

    # Fallback genérico
    if position == "start":
        return f"starting position for {exercise_name} exercise"
    else:
        return f"end/peak contraction position for {exercise_name} exercise"


def slugify(name: str) -> str:
    """Convierte un nombre a slug para nombre de archivo"""
    slug = name.lower()
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    slug = slug.strip('-')
    return slug


def step3_generate_images():
    """Descarga imágenes de wger y genera las faltantes con IA"""
    print("=" * 60)
    print("PASO 3: Descargando/Generando imágenes")
    print("=" * 60)

    OUTPUT_DIR.mkdir(exist_ok=True)

    if not MAPPING_FILE.exists():
        print("  ✗ Ejecuta --step 2 primero")
        return

    with open(MAPPING_FILE, "r", encoding="utf-8") as f:
        mapping = json.load(f)

    report = {"wger_downloaded": [], "ai_generated": [], "failed": []}
    total = len(mapping)

    for i, entry in enumerate(mapping):
        name = entry["anclora_name"]
        slug = slugify(name)
        exercise_dir = OUTPUT_DIR / slug
        exercise_dir.mkdir(exist_ok=True)

        print(f"\n[{i+1}/{total}] {name}")

        if entry["source"] == "wger" and entry["wger_images"]:
            # Descargar de wger
            images = sorted(entry["wger_images"], key=lambda x: x["is_main"], reverse=True)
            for j, img_data in enumerate(images[:2]):  # Máximo 2 imágenes
                suffix = "start" if j == 0 else "end"
                save_path = exercise_dir / f"{slug}-{suffix}.png"

                if save_path.exists():
                    print(f"  ✓ {suffix} ya existe, saltando")
                    continue

                url = img_data["url"]
                print(f"  ⬇ Descargando {suffix} de wger...")
                if download_wger_image(url, save_path):
                    print(f"  ✓ {save_path.name}")
                    report["wger_downloaded"].append(str(save_path))
                else:
                    report["failed"].append({"name": name, "phase": suffix, "reason": "download_failed"})

            # Si wger solo tiene 1 imagen, marcar la segunda como pendiente
            if len(images) < 2:
                suffix = "end" if len(images) == 1 else "start"
                save_path = exercise_dir / f"{slug}-{suffix}.png"
                if not save_path.exists():
                    print(f"  ⚠ wger solo tiene {len(images)} imagen(es), generando {suffix} con IA...")
                    desc = get_pose_description(name, suffix)
                    prompt = PROMPT_TEMPLATE.format(exercise_description=desc, position=suffix)
                    if generate_with_hf(prompt, save_path):
                        print(f"  ✓ {save_path.name} (IA)")
                        report["ai_generated"].append(str(save_path))
                    else:
                        report["failed"].append({"name": name, "phase": suffix, "reason": "generation_failed"})
                    time.sleep(2)

        else:
            # Generar ambas poses con IA
            for suffix in ["start", "end"]:
                save_path = exercise_dir / f"{slug}-{suffix}.png"

                if save_path.exists():
                    print(f"  ✓ {suffix} ya existe, saltando")
                    continue

                desc = get_pose_description(name, suffix)
                prompt = PROMPT_TEMPLATE.format(exercise_description=desc, position=suffix)
                print(f"  🤖 Generando {suffix} con IA...")
                print(f"     Prompt: {prompt[:80]}...")

                if generate_with_hf(prompt, save_path):
                    print(f"  ✓ {save_path.name}")
                    report["ai_generated"].append(str(save_path))
                else:
                    report["failed"].append({"name": name, "phase": suffix, "reason": "generation_failed"})

                time.sleep(3)  # Rate limiting entre generaciones

    # Guardar reporte
    with open(REPORT_FILE, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2, ensure_ascii=False)

    print("\n" + "=" * 60)
    print("RESUMEN DE GENERACIÓN")
    print("=" * 60)
    print(f"  Descargadas de wger:  {len(report['wger_downloaded'])}")
    print(f"  Generadas con IA:     {len(report['ai_generated'])}")
    print(f"  Fallidas:             {len(report['failed'])}")
    print(f"\n  Directorio de salida: {OUTPUT_DIR}")
    print(f"  Reporte: {REPORT_FILE}")

    if report["failed"]:
        print("\n  EJERCICIOS FALLIDOS:")
        for f_entry in report["failed"]:
            print(f"    - {f_entry['name']} ({f_entry['phase']}): {f_entry['reason']}")


# =============================================================================
# UTILIDAD: Generar JSON actualizado con rutas de imágenes
# =============================================================================

def generate_updated_exercises_json():
    """Genera un exercises.json actualizado con las rutas de imágenes"""
    print("=" * 60)
    print("Generando exercises.json actualizado con imageUrl")
    print("=" * 60)

    with open(EXERCISES_JSON, "r", encoding="utf-8") as f:
        exercises = json.load(f)

    updated = 0
    for ex in exercises:
        slug = slugify(ex["name"])
        start_path = OUTPUT_DIR / slug / f"{slug}-start.png"
        end_path = OUTPUT_DIR / slug / f"{slug}-end.png"

        if start_path.exists():
            ex["imageUrl"] = f"/exercises/{slug}/{slug}-start.png"
            ex["imageUrlStart"] = f"/exercises/{slug}/{slug}-start.png"
            updated += 1
        if end_path.exists():
            ex["imageUrlEnd"] = f"/exercises/{slug}/{slug}-end.png"

    output_file = BASE_DIR / "exercises_with_images.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(exercises, f, indent=2, ensure_ascii=False)

    print(f"  ✓ {updated}/{len(exercises)} ejercicios actualizados")
    print(f"  Guardado en: {output_file}")


# =============================================================================
# MAIN
# =============================================================================

def main():
    parser = argparse.ArgumentParser(description="Anclora Impulso — Generador de Imágenes")
    parser.add_argument("--step", required=True,
                        choices=["1", "2", "3", "4", "all"],
                        help="Paso a ejecutar: 1=descargar wger, 2=mapear, 3=generar, 4=actualizar JSON, all=todo")
    args = parser.parse_args()

    if args.step in ("1", "all"):
        step1_download_wger_catalog()

    if args.step in ("2", "all"):
        step2_map_exercises()

    if args.step in ("3", "all"):
        step3_generate_images()

    if args.step in ("4", "all"):
        generate_updated_exercises_json()


if __name__ == "__main__":
    main()