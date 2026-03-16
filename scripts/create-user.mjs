// Script para crear un usuario de prueba via API local.
// No almacena secretos ni credenciales de base de datos.

const API_URL = process.env.TEST_API_URL ?? "http://localhost:3001/api";
const email = process.env.TEST_USER_EMAIL ?? "test@example.com";
const password = process.env.TEST_USER_PASSWORD ?? "Test123456";
const fullName = process.env.TEST_USER_FULL_NAME ?? "Usuario Prueba";

async function createUser() {
  try {
    // Esperar a que el backend esté listo
    console.log("Esperando 10 segundos a que el backend inicie...");
    await new Promise(r => setTimeout(r, 10000));

    console.log(`Intentando crear usuario via API en ${API_URL}...`);

    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        fullName
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log("✓ Usuario creado exitosamente");
      console.log("\nCredenciales:");
      console.log(`  Email: ${email}`);
      console.log(`  Contraseña: ${password}`);
      console.log("  ID: " + data.user.id);
    } else {
      const error = await response.text();
      console.error("✗ Error: " + error);
    }
  } catch (error) {
    console.error("✗ Error:", error.message);
  }
}

createUser();
