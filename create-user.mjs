// Script para crear usuario de prueba
// Usa fetch API y contraseña pre-hasheada

const DATABASE_URL = "postgresql://neondb_owner:npg_e0ViNrD2oUKT@ep-soft-wind-ahhuhbf9-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require";

// Hash bcrypt para "Test123456"
// Generado con: bcrypt.hash('Test123456', 10)
const PASSWORD_HASH = "$2b$10$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5E.xo3UEMLeWe";

async function createUser() {
  try {
    // Esperar a que el backend esté listo
    console.log("Esperando 10 segundos a que el backend inicie...");
    await new Promise(r => setTimeout(r, 10000));

    console.log("Intentando crear usuario via API...");

    const response = await fetch("http://localhost:3001/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "test@example.com",
        password: "Test123456",
        fullName: "Usuario Prueba"
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log("✓ Usuario creado exitosamente");
      console.log("\nCredenciales:");
      console.log("  Email: test@example.com");
      console.log("  Contraseña: Test123456");
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
