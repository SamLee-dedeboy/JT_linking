<script lang="ts">
  const data = $state([
    {
      dimension: "Access Level",
      values: [
        "Water Distribution Equity",
        "Community Engagement Access",
        "Transportation to Water Facilities",
        "Information Accessibility for Communities",
        "Participation in Water Policy Decisions",
        "Infrastructure Development Access",
        "Resource Access for Marginalized Groups",
      ],
    },
    {
      dimension: "Cultural Recognition",
      values: [
        "Acknowledgment of Indigenous Water Rights",
        "Multilingual Engagement Materials",
        "Cultural Heritage Conservation Programs",
        "Representation of Minority Voices",
        "Traditional Ecological Knowledge Integration",
        "Recognition of Cultural Practices in Water Use",
      ],
    },
    {
      dimension: "Fairness in Processes",
      values: [
        "Transparent Decision-Making Frameworks",
        "Inclusive Planning Methodologies",
        "Stakeholder Participation Protocols",
        "Equitable Feedback Mechanisms",
        "Fair Resource Allocation Processes",
        "Community Consultation Guidelines",
      ],
    },
    {
      dimension: "Resource Distribution",
      values: [
        "Equitable Water Supply Allocation",
        "Fair Usage Rights for Communities",
        "Benefit Sharing Agreements",
        "Access to Clean Water Programs",
        "Water Pricing Justice",
        "Resource Scarcity Mitigation Strategies",
      ],
    },
    {
      dimension: "Capacity Building",
      values: [
        "Community Training Programs",
        "Water Advocacy Empowerment Workshops",
        "Leadership Development Initiatives",
        "Local Knowledge Exchange Networks",
        "Skill-Building for Resource Management",
        "Support for Community-Led Initiatives",
      ],
    },
    {
      dimension: "Historical Context",
      values: [
        "Legacy of Environmental Displacement",
        "Historical Analysis of Water Access Disparities",
        "Recognition of Past Injustices",
        "Documentation of Disenfranchised Communities",
        "Impact of Colonial Water Policies",
        "Restoration of Historically Affected Areas",
      ],
    },
    {
      dimension: "Social Inclusion",
      values: [
        "Representation of Diverse Stakeholders",
        "Inclusive Advisory Committees",
        "Outreach Initiatives for Underrepresented Groups",
        "Equitable Representation in Water Boards",
        "Community Coalition Building Efforts",
        "Partnership Development with Marginalized Groups",
      ],
    },
  ]);
</script>

<div class="container flex flex-wrap gap-x-4 gap-y-4 bg-white p-2">
  {#each data as dimension_data}
    <div
      class="dimension-card flex flex-col max-w-[33rem] outline outline-2 outline-slate-400 rounded shadow-md"
    >
      <div
        class="dimension-card-title text-[1.5rem] font-semibold text-slate-700 flex items-center justify-center bg-[#FFF4E0] border-b-2 border-slate-400 p-1"
      >
        {dimension_data.dimension}
      </div>
      <div
        class="dimension-card-values flex flex-wrap bg-[#E8F3FF] gap-2 p-2 grow"
      >
        {#each dimension_data.values as value}
          <div
            class="dimension-card-value border-b-2 border-r-2 border-[#6AAFFB] text-sm text-slate-700 px-1 py-0.5 flex flex-wrap shadow-[0.5px_0.5px_1px_0.5px_lightgray]"
          >
            {value}
          </div>
        {/each}
      </div>
    </div>
  {/each}
</div>

<style lang="postcss">
  .container {
    font-family: "EB Garamond";
  }
</style>
