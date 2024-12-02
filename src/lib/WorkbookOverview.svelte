<script lang="ts">
  let selectedScenario = undefined;
  let selectedCategory = undefined;
  //   fetch()..
</script>

<div class="flex flex-col gap-y-2">
  <div class="flex gap-x-4">
    <select class="" onchange={(e) => (selectedScenario = e.target.value)}>
      <option value="scenario 1">Scenario 1</option>
      <option value="scenario 2">Scenario 2</option>
      <option value="scenario 3">Scenario 3</option>
    </select>
    <select class="" onchange={(e) => (selectedCategory = e.target.value)}>
      <option value="category 1">Category 1</option>
      <option value="category 2">Category 2</option>
      <option value="category 3">Category 3</option>
    </select>
  </div>
  <div>
    {selectedScenario || "Not Selected"} - {selectedCategory || "Not Selected"}
  </div>
</div>
