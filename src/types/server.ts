export type tSummerDiscussionDataByCode = Record<string, tSummerDiscussion[]>
export type tSummerDiscussion = {
    title: string,
    discussion: string,
    explanation: string,
}
export type tSummaryData = {
    code_name: string,
    summary?: string
    occurrences: number
}
export type tScenarioData = {
    name: string,
    number: string,
    narrative: string,
    adaptations: string,
    primary_research_importance: string,
    adaptation: string,
    key_drivers: string,
}
export type tScenarioConnection = {
    scenario: string,
    narrative: string,
    connections: {
        part_of_definition: string,
        explanation: string,
    }[]
}
export type tMessage = {
    render_content: string,
    content: string,
    source: string
}