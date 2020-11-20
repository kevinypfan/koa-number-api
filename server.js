require("dotenv").config();

const Koa = require("koa");
const Router = require("@koa/router");
const cors = require("@koa/cors");
const MongoClient = require("mongodb").MongoClient;

const app = new Koa();
const router = new Router();

const mongoClient = new MongoClient(process.env.MONGODB_URL, {
  useUnifiedTopology: true,
});

let client = null;

router.get("/recent-numbers", async (ctx, next) => {
  try {
    const db = await client.db(process.env.MONGODB_DATABASE);
    const collections = await db.listCollections().toArray();

    const getDatePromises = collections.map((col) => {
      return db.collection(col.name).findOne({}, { sort: { _id: -1 } });
    });
    ctx.body = await Promise.all(getDatePromises);
  } catch (error) {
    console.log(error);
    ctx.body = error;
    ctx.status = 400;
  }
});

// add the router to our app
app.use(cors());
app.use(router.routes());
app.use(router.allowedMethods());

// start the server
mongoClient.connect().then((result) => {
  app.listen(process.env.PORT);
  client = result;
});
