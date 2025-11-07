var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// import dotenv from "dotenv";
const surf_conditions_1 = require("./routes/surf-conditions");
// dotenv.config({ path: ".env" });
const app = (0, express_1.default)();
app.get("/surf-conditions", surf_conditions_1.surfConditions);
const port = parseInt(process.env.PORT || "8080", 10);
app.listen(port, () => {
  console.log(`Vandozi: listening on port ${port}`);
});
