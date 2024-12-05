export type tSummerDiscussionDataByCode = Record<string, tSummerDiscussion[]>
export type tSummerDiscussion = {
    title: string,
    discussion: string,
    explanation: string,
}
export type tSummaryData = {
    code_name: string,
    summary: string
}