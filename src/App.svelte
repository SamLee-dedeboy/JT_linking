<script lang="ts">
  import { onMount } from "svelte";

  const server_address = "http://127.0.0.1:5000";
  let question = "";
  let summaries: string[] = [];
  let errorMessage = "";

  // Function to handle the POST request
  async function fetchSummaries() {
    if (!question) {
      errorMessage = "Please enter a question!";
      return;
    }

    try {
      const response = await fetch(server_address + "/codes/question/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: question }),
      });

      const data = await response.json();
      
      // If summaries are found, display them
      if (data.summaries && data.summaries.length > 0) {
        summaries = data.summaries;
        errorMessage = ""; // Clear any previous error messages
      } else {
        summaries = [];
        errorMessage = "No summaries found for the given question.";
      }
    } catch (error) {
      errorMessage = "An error occurred while fetching the summaries.";
      console.error("Error:", error);
    }
  }
</script>

<main>
  <div class="container">
    <h1>Interview Summaries</h1>
    <label for="question">Enter a Question:</label>
    <input
      type="text"
      id="question"
      bind:value={question}
      placeholder="Enter your question here"
    />
    <button on:click={fetchSummaries}>Get Summaries</button>

    {#if errorMessage}
      <p class="error">{errorMessage}</p>
    {/if}

    {#if summaries.length > 0}
      <div id="summaries">
        {#each summaries as summary}
          <div class="summary">{JSON.stringify(summary, null, 2)}</div>
        {/each}
      </div>
    {:else if !errorMessage}
      <p>No data available to display.</p>
    {/if}
  </div>
</main>

<style>
  * {
    box-sizing: border-box;
  }

  body {
    font-family: Arial, sans-serif;
    margin: 0;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #f4f4f4;
  }

  .container {
    width: 400px;
    padding: 20px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  h1 {
    text-align: center;
  }

  label {
    font-size: 1.1em;
  }

  input[type="text"] {
    width: 100%;
    padding: 10px;
    margin: 10px 0;
    font-size: 1em;
    border: 1px solid #ddd;
    border-radius: 4px;
  }

  button {
    width: 100%;
    padding: 10px;
    font-size: 1.1em;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  button:hover {
    background-color: #45a049;
  }

  .summary {
    background-color: #f9f9f9;
    border: 1px solid #ddd;
    padding: 10px;
    margin-top: 10px;
    font-size: 1em;
    border-radius: 4px;
    white-space: pre-wrap; 
  }

  .error {
    color: red;
    font-size: 1em;
    text-align: center;
  }
</style>


 