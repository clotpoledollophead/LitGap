// Module for making API calls to the LLM service

export const apiService = {
  modelVariant: "academic-analysis", // Default model variant

  setModel(model) {
    this.modelVariant = model;
  },

  async callLLM(message, history = []) {
    history.push({ role: "user", parts: [{ text: message }] });

    // Create FormData for the POST request
    const formData = new FormData();
    formData.append("mes", message);
    formData.append("history", JSON.stringify(history));

    try {
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbxm25QuCJcPY_JXhS7o3FisD8j1AVOpLKlk5V-TDemOsDVVyZsyEGmD5FiXtNpvoHxR/exec",
        {
          method: "POST",
          body: formData,
        }
      );

      const responseText = await response.text();
      history.push({ role: "model", parts: [{ text: responseText }] });
      console.log(history);
      return responseText;
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  },
};
