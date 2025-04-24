import { config } from "dotenv";
import { createServer } from "./config/server.js";

config();

const init = async () => {
	try {
		const app = createServer();

		const port = process.env.PORT || 1000;
		app.listen(port, () => {
			console.log(`Server listening on port ${port}`);
		});
	} catch (err) {
		console.error("Failed to initialize application:", err);
	}
};

init();
