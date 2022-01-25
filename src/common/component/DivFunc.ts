export function parseDept3Div(div: string) : string {
    if(div === 'M0301') return UnitDivType.NOOP; // 사용하지 않음
    else if(div === 'M0302') return UnitDivType.MEDA; // 사용하지 않음
    else if(div === 'M0303') return UnitDivType.OPAL; // 사용하지 않음
    else if(div === 'M0304') return UnitDivType.GEO; // 사용하지 않음
    else if(div === 'M0305') return UnitDivType.TOPIC; 
    else if(div === 'M0306') return UnitDivType.MODULEREVIEW; 
    return UnitDivType.NONE;
}
export function parseDept4Div(div: string) : string {
    if(div === 'M0401') return LessonType.CONCEPT; // 사용하지 않음 
    else if(div === 'M0402') return LessonType.PROBLEM; // 사용하지 않음
    else if(div === 'M0403') return LessonType.STRATEGY; // 사용하지 않음
    else if(div === 'M0404') return LessonType.NOOP; // 사용하지 않음
    else if(div === 'M0405') return LessonType.MEDA; // 사용하지 않음
    else if(div === 'M0406') return LessonType.OPAL; // 사용하지 않음
    else if(div === 'M0407') return LessonType.GEO; // 사용하지 않음
    else if(div === 'M0408') return LessonType.CONCEPTLEARNING; 
    else if(div === 'M0409') return LessonType.TOPICLEARNING; 
    else if(div === 'M0410') return LessonType.MODULELEARNING; 
    else if(div === 'M0411') return LessonType.MODULETEST; 
    return LessonType.NONE;
}
export function parseDept5Div(div: string) : string {
    if(div === 'M0501') return StepGroupType.WARMUP;
    else if(div === 'M0502') return StepGroupType.CONCEPTLEARNING;
    else if(div === 'M0503') return StepGroupType.CONCEPTLEARNING2;
    else if(div === 'M0504') return StepGroupType.CONCEPTLEARNING3;
    else if(div === 'M0505') return StepGroupType.PROBLEMSOLVING;
    else if(div === 'M0506') return StepGroupType.WRAPUP;
    else if(div === 'M0507') return StepGroupType.TOPICLEARNING;
    else if(div === 'M0508') return StepGroupType.MODULELEARNING;
    else if(div === 'M0509') return StepGroupType.MODULETEST;
    return StepGroupType.NONE;
}
export function parseDept5SubDiv(div: string) : string {
    if(div === 'M050101') return StepType.WARMUPACTIVITY;
    else if(div === 'M050102') return StepType.LEARNINGOBJECTS;
    else if(div === 'M050103') return StepType.CONCEPTSUMMAMRY;
    else if(div === 'M050201') return StepType.CONCEPTLEARNING;
    else if(div === 'M050202') return StepType.CONCEPTACTIVITY;
    else if(div === 'M050203') return StepType.CONCEPTTOOL; 
    else if(div === 'M050204') return StepType.CONCEPTSUMMAMRY;
    else if(div === 'M050301') return StepType.ACTIVITY; // 사용하지 않음 
    else if(div === 'M050302') return StepType.CONCEPTTOOL; // 사용하지 않음 
    else if(div === 'M050303') return StepType.SUMMAMRY; // 사용하지 않음 
    else if(div === 'M050304') return StepType.CHECK; // 사용하지 않음 
    else if(div === 'M050401') return StepType.ACTIVITY; // 사용하지 않음 
    else if(div === 'M050402') return StepType.CONCEPTTOOL; // 사용하지 않음 
    else if(div === 'M050403') return StepType.SUMMAMRY; // 사용하지 않음 
    else if(div === 'M050404') return StepType.CHECK; // 사용하지 않음 
    else if(div === 'M050501') return StepType.INDEPENDENTPRACTICE;
    else if(div === 'M050502') return StepType.EXTENDEDPRACTICE; 
    else if(div === 'M050503') return StepType.STRATEGY;  
    else if(div === 'M050504') return StepType.REASONING2; // 사용하지 않음 
    else if(div === 'M050505') return StepType.STRATEGY;  
    else if(div === 'M050601') return StepType.WRAPUPACTIVITY; 
    else if(div === 'M050602') return StepType.PORTFOLIO;
    else if(div === 'M050701') return StepType.TOPICSTRATEGY;  
    else if(div === 'M050702') return StepType.ADAPTIVELEARNING1;
    else if(div === 'M050801') return StepType.MODULEREVIEW;  
    else if(div === 'M050802') return StepType.ADAPTIVELEARNING2;
    else if(div === 'M050803') return StepType.MODULEPORTFOLIO;
    else if(div === 'M050804') return StepType.MODULESTRATEGY;
    else if(div === 'M050901') return StepType.ASSESSMENT;  
    else if(div === 'M050902') return StepType.MODULEPORTFOLIO; // 사용하지 않음  
    else if(div === 'M050903') return StepType.ASSESSMENTREVIEW;
    else if(div === 'M050904') return StepType.STEAMACTIVITY;
    else if(div === 'M050905') return StepType.STEAMPORTFOLIO;
    else return StepType.NONE;
}
export function parseClassColor(curriculumColor: string): string {
    if(curriculumColor === 'B62001') return ClassColorType.BLACK;
    else return ClassColorType.WHITE;
} 
