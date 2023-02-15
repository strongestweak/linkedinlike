var createError = require("http-errors");
require("dotenv").config();
var express = require("express");
require("express-async-errors");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var finale = require("finale-rest");
var cookieParser = require("cookie-parser");
const { sequelize, Sequelize, ...models } = require("./models");

var indexRouter = require("./routes/index");
const authUserMiddleware = require("./routes/authUserMiddleware");
var app = express();
app.use(cookieParser());

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

finale.initialize({
  app: app,
  sequelize: sequelize,
});

app.use("/rest/", authUserMiddleware);
app.use("/functions/", authUserMiddleware);

Object.keys(models).map((modelKey) => {
  const excluded = ["Session"];
  if (!excluded.includes(modelKey)) {
    var resources = finale.resource({
      model: models[modelKey],
      endpoints: ["/rest/" + modelKey, "/rest/" + modelKey + "/:id"],
    });
    console.log(resources.endpoints);

    ((resources) => {
      resources.all.fetch.before((req, res, context) => {
        context.options = { ...context?.options, user: req.user };
        if (req?.query?.include) {
          context.include = (req?.query?.include || "")
            .split(",")
            .map((e) => e.trim());
        }
        return context.continue;
      });

      resources.all.fetch.after(async (req, res, context) => {
        try {
          const modelClass = models[modelKey];
          let scopes = req?.query?.scope;
          if(typeof scopes === 'string'){
            scopes = [scopes]
          }
          (scopes || []).forEach((scope) => {
            if (scope?.method) {
              modelClass.addScope(scope?.method);
            }
          });
          const result = await modelClass.findAll({
            ...context?.options,
            limit: undefined,
            offset: undefined,
            hooks: false,
          });
          const wrongContentRange = res.getHeaders()["content-range"];
          const correctedContentRange = `${wrongContentRange.split("/")[0]}/${
            result.length
          }`;
          res.header("Content-Range", correctedContentRange);
        } catch (err) {
          console.log(err);
        }
        return context.continue;
      });
    })(resources);
  }
});

app.use("/functions", indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.json({ message: err.message });
});

module.exports = app;
