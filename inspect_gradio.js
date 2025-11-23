import { Client } from "@gradio/client";

async function inspect() {
    try {
        console.log("Connecting to yisol/IDM-VTON...");
        const client = await Client.connect("yisol/IDM-VTON");

        console.log("Connected. Fetching API info...");
        const apiInfo = await client.view_api();

        console.log("Full API Info:");
        console.log(JSON.stringify(apiInfo, null, 2));

    } catch (error) {
        console.error("Error inspecting API:", error);
    }
}

inspect();
