const functions = require("firebase-functions");
const admin = require("firebase-admin");
const stripe = require("stripe")("sk_test_51QtuVsL1yTesinWfIEiIDadSCQCZtzzKAqqcpVhYsrYXip3HugNqNyi1ssxZw5gDqoOmGiYFeQFg23E8LcQsPsTm00CFTdKlxX"); // Reemplaza con tu clave secreta de Stripe
const cors = require("cors")({ origin: true });

admin.initializeApp();
const db = admin.firestore();

// 1. Crear perfil
exports.crearPerfil = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    const { nombre, edad, tarjetaCredito, caducidad, cvv } = req.query;

    const perfil = {
      nombre,
      edad: parseInt(edad),
      tarjetaCredito,
      caducidad,
      cvv,
      fechaCreacion: new Date(),
    };

    try {
      const docRef = await db.collection("Perfil").add(perfil);
      res.status(200).json({ id: docRef.id });
    } catch (error) {
      res.status(500).json({ error: "Error al crear el perfil" });
    }
  });
});

// 2. Obtener perfil por UID fffff
exports.obtenerPerfil = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    const { uid } = req.query;

    try {
      const doc = await db.collection("Perfil").doc(uid).get();
      if (!doc.exists) {
        res.status(404).json({ error: "Perfil no encontrado" });
      } else {
        res.status(200).json(doc.data());
      }
    } catch (error) {
      res.status(500).json({ error: "Error al obtener el perfil" });
    }
  });
});

// 3. Obtener perfiles mayores de una edad
exports.obtenerPerfiles = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    const { edadMin } = req.query;

    try {
      const snapshot = await db.collection("Perfil")
        .where("edad", ">", parseInt(edadMin))
        .get();
      const perfiles = [];
      snapshot.forEach((doc) => {
        perfiles.push({ id: doc.id, ...doc.data() });
      });
      res.status(200).json(perfiles);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener los perfiles" });
    }
  });
});

// 4. Crear producto
exports.crearProducto = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    const { nombre, precio } = req.query;

    const producto = {
      nombre,
      precio: parseFloat(precio),
      fechaCreacion: new Date(),
    };

    try {
      const docRef = await db.collection("Productos").add(producto);
      res.status(200).json({ id: docRef.id });
    } catch (error) {
      res.status(500).json({ error: "Error al crear el producto" });
    }
  });
});

// 5. Pagar producto
exports.pagarProducto = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    const { uidProducto, uidUsuario } = req.query;

    try {
      const productoDoc = await db.collection("Productos").doc(uidProducto).get();
      const perfilDoc = await db.collection("Perfil").doc(uidUsuario).get();

      if (!productoDoc.exists || !perfilDoc.exists) {
        res.status(404).json({ error: "Producto o perfil no encontrado" });
        return;
      }

      const producto = productoDoc.data();
      const perfil = perfilDoc.data();

      const paymentIntent = await stripe.paymentIntents.create({
        amount: producto.precio * 100, // Stripe espera el monto en centavos
        currency: "usd",
        payment_method: "pm_card_visa", // Usar un método de pago de prueba
        confirm: true,
        description: `Pago por producto: ${producto.nombre}`,
      });

      const recibo = {
        uidUsuario,
        uidProducto,
        monto: producto.precio,
        fechaPago: new Date(),
        stripePaymentId: paymentIntent.id,
      };

      await db.collection("Perfil")
        .doc(uidUsuario)
        .collection("Recibos")
        .add(recibo);

      res.status(200).json({ success: true, recibo });
    } catch (error) {
      res.status(500).json({ error: "Error al procesar el pago", details: error.message });
    }
  });
});

// 6. Obtener todos los recibos
exports.obtenerRecibos = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    try {
      const snapshot = await db.collectionGroup("Recibos").get();
      const recibos = [];
      snapshot.forEach((doc) => {
        recibos.push({ id: doc.id, ...doc.data() });
      });
      res.status(200).json(recibos);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener los recibos" });
    }
  });
});