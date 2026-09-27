export interface Question {
  id: number;
  qNum: string;
  text: string;
  options: string[];
  correctIndex: number; // 0-based
  hint: string;
}

export const questions: Question[] = [
  {
    id: 1, qNum: "Q.52",
    text: "Match List-I with List-II.\n\nList-I:\nA. Two factor theory of intelligence\nB. Primary mental abilities\nC. Triarchic theory of intelligence\nD. Theory of multiple intelligence\n\nList-II:\nI. Howard Gardner\nII. Thurstone\nIII. Charles Spearman\nIV. Sternberg\n\nChoose the correct answer:",
    options: ["A-III, B-IV, C-I, D-II","A-III, B-II, C-IV, D-I","A-III, B-I, C-II, D-IV","A-III, B-II, C-I, D-IV"],
    correctIndex: 1,
    hint: "Spearman = g + s / two-factor; Thurstone = primary mental abilities; Sternberg = triarchic; Gardner = multiple intelligences."
  },
  {
    id: 2, qNum: "Q.53",
    text: "Given below are two statements:\n\nAssertion (A): Creative thinking always requires divergent thinking.\nReason (R): Divergent thinking helps in generating multiple solutions to a single problem.\n\nChoose the most appropriate answer:",
    options: [
      "Both (A) and (R) are correct and (R) is the correct explanation of (A).",
      "Both (A) and (R) are correct but (R) is not the correct explanation of (A).",
      "(A) is correct but (R) is not correct.",
      "(A) is not correct but (R) is correct."
    ],
    correctIndex: 3,
    hint: "Think about divergent thinking = generating many possibilities. Creative thinking can also involve convergent thinking, so (A) is not always true."
  },
  {
    id: 3, qNum: "Q.54",
    text: "Arrange the development of the following personality tests in chronological order:\n\nA. Rorschach Inkblot Test\nB. Draw-A-Man task\nC. Thematic Apperception Test\nD. 16 Personality Factor\n\nChoose the correct answer:",
    options: ["A, B, C, D","A, C, B, D","A, C, D, B","A, D, B, C"],
    correctIndex: 0,
    hint: "Remember the years: Rorschach (1921) → Draw-a-Man (1926) → TAT (1935) → 16PF (1949)."
  },
  {
    id: 4, qNum: "Q.55",
    text: "Research by Steven Maier suggests that learned helplessness may be due to a higher-level region of the brain known as the ______, which helps subjects determine what is controllable.",
    options: ["Amygdala","Ventromedial prefrontal cortex","Hippocampus","Dorsal raphe nucleus"],
    correctIndex: 1,
    hint: "Maier's learned-helplessness research points toward the prefrontal cortex, especially the ventromedial region, in judging controllability."
  },
  {
    id: 5, qNum: "Q.56",
    text: "The gaps between sections of myelin are called:",
    options: ["Myelin sheath","Axon hillock","Dendrites","Nodes of Ranvier"],
    correctIndex: 3,
    hint: "Myelin has small gaps where the axon membrane is exposed. Think 'nodes' between myelin segments."
  },
  {
    id: 6, qNum: "Q.57",
    text: "During which of the following psychosexual stages does the male child develop the Oedipus Complex?",
    options: ["Anal stage","Latency stage","Phallic stage","Genital stage"],
    correctIndex: 2,
    hint: "Freud's phallic stage (ages 3-6) is associated with the Oedipus complex."
  },
  {
    id: 7, qNum: "Q.58",
    text: "Arrange the following theories of motivation in chronological order with respect to the year of development:\n\nA. Deci's self-determination theory\nB. McClelland's need achievement theory\nC. Maslow's hierarchy of needs\nD. Dweck's self-theory\n\nChoose the correct answer:",
    options: ["B, C, A, D","D, A, C, B","C, B, D, A","A, B, D, C"],
    correctIndex: 0,
    hint: "Remember the approximate chronology: McClelland (1961) → Maslow (1943 — but publication was 1954) → Deci (1985) → Dweck (1999)."
  },
  {
    id: 8, qNum: "Q.60",
    text: "The following two are the major contributions of Thorndike's doctrine in the field of Psychology:\n\nA. Associative shifting\nB. Law of similarity\nC. Law of effect\nD. Extinction\n\nChoose the correct answer:",
    options: ["A and B Only","A and C Only","B and C Only","A and D Only"],
    correctIndex: 1,
    hint: "Thorndike is especially famous for the Law of Effect. His early work also included associative shifting."
  },
  {
    id: 9, qNum: "Q.61",
    text: "_____ is the assumption that everything that happens in the universe can be accounted for by definite laws of causation.",
    options: ["Mechanism","Operationism","Natural monism","Determinism"],
    correctIndex: 3,
    hint: "The belief that events occur according to definite cause-and-effect laws = determinism."
  },
  {
    id: 10, qNum: "Q.62",
    text: "Which of the following statements are true in the context of sampling?\n\nA. Purposive sampling is probability sampling\nB. Snowball sampling is based upon sociometry\nC. 'G' power is used to estimate sample size\nD. Sampling error increases with sample size\nE. Standard deviation of sampling distribution is sampling error\n\nChoose the correct answer:",
    options: ["A, C and D Only","B, C and D Only","B, C and E Only","A, D and E Only"],
    correctIndex: 2,
    hint: "Purposive and snowball are non-probability methods. G*Power helps determine sample size. SD of sampling distribution = standard error (sampling error)."
  },
  {
    id: 11, qNum: "Q.63",
    text: "In which of the following statistical analyses will there be more than one dependent/criterion variable?",
    options: ["Multiple Regression","Simple Regression","Canonical Correlation","Three-way Analysis of Variance"],
    correctIndex: 2,
    hint: "Canonical correlation involves multiple criterion/dependent variables simultaneously."
  },
  {
    id: 12, qNum: "Q.64",
    text: "The human belly button is a _____; it serves no adaptive function and is merely the by-product of the umbilical cord.",
    options: ["Homologous","Analogous","Spandrels","Exaptations"],
    correctIndex: 2,
    hint: "A structure that exists without being directly designed for its current function is described as a spandrel (evolutionary by-product)."
  },
  {
    id: 13, qNum: "Q.65",
    text: "Match List-I with List-II.\n\nList-I:\nA. Confluence\nB. Retroflection\nC. Deflection\nD. Introjection\n\nList-II:\nI. Absence of difference between self and others\nII. Lack of discrimination or assimilation of new information gained\nIII. Avoidance of contact with others\nIV. Suppression of behaviour and the redirection back onto the self\n\nChoose the correct answer:",
    options: ["A-I, B-IV, C-III, D-II","A-I, B-III, C-IV, D-II","A-II, B-III, C-I, D-IV","A-III, B-II, C-I, D-IV"],
    correctIndex: 0,
    hint: "Confluence→no distinction between self/others (I); Retroflection→turning behaviour back toward self (IV); Deflection→avoiding contact (III); Introjection→accepting without assimilation (II)."
  },
  {
    id: 14, qNum: "Q.66",
    text: "Which motivational theory relies heavily on the concept of homeostasis?",
    options: ["Instinctual theory","Need for affiliation theory","Drive reduction theory","Need for achievement theory"],
    correctIndex: 2,
    hint: "Homeostasis → maintaining internal balance → drive reduction theory (Hull)."
  },
  {
    id: 15, qNum: "Q.67",
    text: "What would be the correct sequence while developing a robust questionnaire?\n\nA. Content/Construct validity\nB. Confirmatory Factor Analysis\nC. Item Discrimination Index\nD. Exploratory Factor Analysis\nE. Norm development\n\nChoose the correct answer:",
    options: ["C, A, B, D, E","C, D, B, A, E","C, D, A, B, E","C, A, D, B, E"],
    correctIndex: 1,
    hint: "Think of the questionnaire-development progression: item analysis (C) → exploration (D) → confirmation (B) → validity (A) → norms (E)."
  },
  {
    id: 16, qNum: "Q.68",
    text: "Match List-I with List-II.\n\nList-I:\nA. Allport\nB. Cattell\nC. H. J. Eysenck\nD. Sigmund Freud\n\nList-II:\nI. 16 PF — Surface and source traits\nII. Cardinal, central, secondary traits\nIII. Psychosexual stages of development\nIV. Extraversion-Neuroticism-Psychoticism dimensions\n\nChoose the correct answer:",
    options: ["A-I, B-III, C-IV, D-II","A-III, B-I, C-II, D-IV","A-II, B-I, C-IV, D-III","A-IV, B-II, C-I, D-III"],
    correctIndex: 2,
    hint: "Allport → traits (Cardinal, Central, Secondary = II); Cattell → 16PF (I); Eysenck → E-N-P (IV); Freud → psychosexual stages (III)."
  },
  {
    id: 17, qNum: "Q.69",
    text: "Correct sequence in Lazarus's Cognitive Mediational Theory of emotion:\n\nA. Appraisal\nB. Bodily response\nC. Stimulus\nD. Emotional response\n\nChoose the correct answer:",
    options: ["A, D, B, C","C, D, B, A","C, A, D, B","B, C, D, A"],
    correctIndex: 2,
    hint: "Lazarus: Stimulus (C) → Appraisal (A) → Emotional response (D) → Bodily response (B)."
  },
  {
    id: 18, qNum: "Q.70",
    text: "_____ Test is a non-reading and motor-reduced test.",
    options: ["16 Personality Factor Test","Big Five Personality Test","Thematic Apperception Test","Peabody Picture Vocabulary Test-IV"],
    correctIndex: 3,
    hint: "A test designed for people who may have limited reading ability and minimizes motor demands = picture vocabulary test (PPVT-IV)."
  },
  {
    id: 19, qNum: "Q.71",
    text: "According to Wundt, the ability to arrange willfully the elements of thought into any number of configurations is called:",
    options: ["Cognitive map","Confirmable proposition","Creative synthesis","Wishful thinking"],
    correctIndex: 2,
    hint: "Wundt used the term 'creative synthesis' for the active, willful organization of mental elements."
  },
  {
    id: 20, qNum: "Q.72",
    text: "Arrange Prochaska's stage model:\n\nA. Contemplation\nB. Precontemplation\nC. Action\nD. Preparation\nE. Maintenance\n\nChoose the correct answer:",
    options: ["B, A, C, D, E","B, C, A, E, D","B, D, A, E, C","B, A, D, C, E"],
    correctIndex: 3,
    hint: "Prochaska's sequence: Precontemplation → Contemplation → Preparation → Action → Maintenance."
  },
  {
    id: 21, qNum: "Q.73",
    text: "Given below are two statements:\n\nAssertion (A): One psychologist changed the level of significance from 0.05 to 0.01. This can increase the probability of Type II error.\nReason (R): Type II error is caused by wrongful acceptance of Null hypothesis.\n\nChoose the most appropriate answer:",
    options: [
      "Both (A) and (R) are correct and (R) is the correct explanation of (A).",
      "Both (A) and (R) are correct but (R) is not the correct explanation of (A).",
      "(A) is correct but (R) is not correct.",
      "(A) is not correct but (R) is correct."
    ],
    correctIndex: 1,
    hint: "Lowering α from .05 to .01 makes rejecting H₀ harder, which can increase Type II error. Both statements are true, but the R doesn't explain the mechanism of why changing α affects Type II error."
  },
  {
    id: 22, qNum: "Q.74",
    text: "Match List-I with List-II.\n\nList-I:\nA. Biographical Research\nB. Ethnography\nC. Grounded Theory\nD. Phenomenological Approach\n\nList-II:\nI. Lived Experiences\nII. Theoretical Saturation\nIII. Retrospective Studies\nIV. Cultural Anthropology\n\nChoose the correct answer:",
    options: ["A-II, B-IV, C-III, D-I","A-III, B-IV, C-I, D-II","A-IV, B-III, C-I, D-II","A-I, B-III, C-IV, D-II"],
    correctIndex: 1,
    hint: "Biography → past life/Retrospective (III); Ethnography → culture (IV); Grounded theory → theory saturation (II)→ but note the correct answer per key is option 2 (A-III, B-IV, C-I, D-II). The standard matching A-III,B-IV,C-II,D-I is not listed."
  },
  {
    id: 23, qNum: "Q.75",
    text: "Given below are two statements:\n\nAssertion (A): In a memory experiment, participants were found to use both verbal and visual encoding while performing the given task.\nReason (R): Episodic buffer, a component of working memory, is used to integrate and to store briefly the information from phonological loop and visuospatial sketch-pad.\n\nChoose the most appropriate answer:",
    options: [
      "Both (A) and (R) are correct and (R) is the correct explanation of (A).",
      "Both (A) and (R) are correct but (R) is not the correct explanation of (A).",
      "(A) is correct but (R) is not correct.",
      "(A) is not correct but (R) is correct."
    ],
    correctIndex: 0,
    hint: "Baddeley's episodic buffer integrates information from the phonological loop (verbal) and visuospatial sketchpad (visual) — directly explaining why both verbal and visual encoding occur."
  },
  {
    id: 24, qNum: "Q.76",
    text: "According to Richard Lazarus, when someone asks himself, 'How can I deal with this potentially harmful stressor?' the individual is focused on a:",
    options: ["Primary","Secondary","Tertiary","Minimal"],
    correctIndex: 1,
    hint: "Primary appraisal = 'Is this threatening?' Secondary appraisal = 'How can I deal with it?' — that's what the question describes."
  },
  {
    id: 25, qNum: "Q.77",
    text: "Which of the following is the non-parametric counterpart of two-way ANOVA?",
    options: ["Wilcoxon Sign Test","Kruskal-Wallis Test","Spearman's Rank Order Test","Friedman's Test"],
    correctIndex: 3,
    hint: "For two-way/repeated-measures ANOVA-type designs, think of the non-parametric Friedman test."
  },
  {
    id: 26, qNum: "Q.78",
    text: "Which psychophysiological technique measures the Skin Conductance Response (SCR)?",
    options: ["Electroencephalography","CT-Scan","Electromyography","Electrodermal Activity"],
    correctIndex: 3,
    hint: "SCR = skin conductance, which is measured through electrodermal activity (EDA)."
  },
  {
    id: 27, qNum: "Q.79",
    text: "Given below are two statements:\n\nAssertion (A): Classical conditioning is faster when UCS is presented immediately after CS rather than before.\nReason (R): According to the cognitive perspective, classical conditioning occurs because CS provides expectancy about the coming of UCS.\n\nChoose the most appropriate answer:",
    options: [
      "Both (A) and (R) are correct and (R) is the correct explanation of (A).",
      "Both (A) and (R) are correct but (R) is not the correct explanation of (A).",
      "(A) is correct but (R) is not correct.",
      "(A) is not correct but (R) is correct."
    ],
    correctIndex: 0,
    hint: "Delay conditioning (CS before UCS) is most effective. Cognitive theory: CS acts as a signal/predictor of UCS, creating expectancy. Both A and R are correct and R explains A."
  },
  {
    id: 28, qNum: "Q.80",
    text: "Which one of the following is not included in the four skills of Dialectical Behaviour Therapy?",
    options: ["Core mindfulness skills","Emotional Regulation skills","Intrapersonal Effectiveness skills","Distress Tolerance skills"],
    correctIndex: 2,
    hint: "DBT's four modules: Mindfulness, Distress Tolerance, Emotion Regulation, Interpersonal Effectiveness (NOT Intrapersonal)."
  },
  {
    id: 29, qNum: "Q.81",
    text: "Context-dependent forgetting explains:\n\nA. Forgetting occurs when context at retrieval differs from encoding.\nB. It is supported by the encoding specificity principle.\nC. It only applies to procedural memory.\nD. It is unrelated to environmental cues.\n\nChoose the correct answer:",
    options: ["A and D Only","A, B and C Only","A and B Only","B and C Only"],
    correctIndex: 2,
    hint: "Context-dependent forgetting = retrieval context differs from encoding context (A) and is linked to encoding specificity principle (B). C and D are false."
  },
  {
    id: 30, qNum: "Q.82",
    text: "How many emotions are identified as basic emotions that are universal across cultures by Paul Ekman?",
    options: ["Five","Six","Four","Seven"],
    correctIndex: 1,
    hint: "Ekman's classic basic-emotion model identifies six: happiness, sadness, anger, fear, disgust, and surprise."
  },
  {
    id: 31, qNum: "Q.83",
    text: "Rorschach Inkblot Test consists of how many inkblots devised by Herman Rorschach (1884–1922)?",
    options: ["05","10","13","30"],
    correctIndex: 1,
    hint: "Rorschach uses exactly 10 standardized inkblot cards."
  },
  {
    id: 32, qNum: "Q.84",
    text: "Which is not the core condition of Effective Counselling?",
    options: ["Reflection","Empathy","Unconditional Positive Regard","Congruence"],
    correctIndex: 0,
    hint: "Rogers' core conditions (the therapeutic triad): Empathy, Congruence (genuineness), Unconditional Positive Regard. Reflection is a technique, not a core condition."
  },
  {
    id: 33, qNum: "Q.85",
    text: "World Health Organization (WHO) has defined five key principles to outline the areas of health promotion. Which is not correct according to WHO?",
    options: [
      "Health professionals should be consulted and involved in health promotion.",
      "Health promotion should be focused on specific target groups.",
      "Promotion should include public participation and encourage the formation of self-help groups.",
      "The promotion should be focused on the cause of health problem, including the individual's environment."
    ],
    correctIndex: 0,
    hint: "Look for the statement that is not one of the five WHO principles. The focus on specific target groups contradicts WHO's universal approach."
  },
  {
    id: 34, qNum: "Q.86",
    text: "Given below are two statements:\n\nAssertion (A): Adaptation is the developing skills required by one's particular environment.\nReason (R): Successful adaptation will differ from one culture to the next.\n\nChoose the most appropriate answer:",
    options: [
      "Both (A) and (R) are correct and (R) is the correct explanation of (A).",
      "Both (A) and (R) are correct but (R) is not the correct explanation of (A).",
      "(A) is correct but (R) is not correct.",
      "(A) is not correct but (R) is correct."
    ],
    correctIndex: 0,
    hint: "Adaptation involves developing skills suited to one's environment (A), and since environments differ culturally, successful adaptation varies by culture (R explains A)."
  },
  {
    id: 35, qNum: "Q.87",
    text: "Method of limits, a specialized technique chiefly useful in the determination of sensory threshold, is contributed by:",
    options: ["Ernst Weber","Gustav Fechner","Hermann von Helmholtz","Wilhelm Wundt"],
    correctIndex: 1,
    hint: "Fechner developed psychophysics and the classical methods for measuring sensory thresholds, including the method of limits."
  },
  {
    id: 36, qNum: "Q.88",
    text: "Given below are two statements:\n\nAssertion (A): Resilience refers to the ability to adapt positively despite adversity.\nReason (R): It is simply the absence of stress in one's life.\n\nChoose the most appropriate answer:",
    options: [
      "Both (A) and (R) are correct and (R) is the correct explanation of (A).",
      "Both (A) and (R) are correct but (R) is not the correct explanation of (A).",
      "(A) is correct but (R) is not correct.",
      "(A) is not correct but (R) is correct."
    ],
    correctIndex: 2,
    hint: "Resilience means positive adaptation despite adversity (A is correct). The Reason is wrong — resilience is NOT simply the absence of stress."
  },
  {
    id: 37, qNum: "Q.89",
    text: "Bhabesh plays violent videogames not because of their violent content, rather he enjoys the feeling of mastery and competence it provides. This explanation of aggression is put forth by:",
    options: ["Frustration-aggression hypothesis","General aggression model","Catharsis hypothesis","Cognitive Evaluation Theory"],
    correctIndex: 3,
    hint: "The clue is mastery and competence — these are intrinsic motivation concepts from Cognitive Evaluation Theory (Deci & Ryan)."
  },
  {
    id: 38, qNum: "Q.90",
    text: "Which one of the following combinations is not correct?",
    options: ["Physical World – Umwelt","Psychological World – Eigenwelt","Social World – Life welt","Spiritual World – Uber welt"],
    correctIndex: 3,
    hint: "Existential psychology: Umwelt = physical world, Mitwelt = social world, Eigenwelt = psychological/self-world. 'Uber welt' is not the standard term for spiritual world."
  },
  {
    id: 39, qNum: "Q.91",
    text: "Carroll Ryff's Psychological Well-being model includes six dimensions. Which one of the following is correct according to this model?",
    options: [
      "Self Acceptance, Environmental Mastery, Personal Growth, Purpose in Life, Autonomy",
      "Environmental Mastery, Autonomy, Positive Relationship, Self Acceptance, Optimism",
      "Autonomy, Purpose in Life, Positive Relationship, Personal Growth, Grit",
      "Life Purpose, Environmental Mastery, Resilience, Autonomy, Relationship"
    ],
    correctIndex: 0,
    hint: "Ryff's six dimensions: Self-acceptance, Positive relations with others, Autonomy, Environmental mastery, Purpose in life, Personal growth. Option 1 lists five of the genuine six."
  },
  {
    id: 40, qNum: "Q.92",
    text: "Which is the correct option for the Flynn effect?",
    options: [
      "Intelligence scores are relatively stable in developed countries.",
      "Intelligence scores are decreasing due to over-reliance on technology.",
      "Intelligence scores are steadily increasing in modernized countries.",
      "Intelligence scores are cumulative based on different cultures."
    ],
    correctIndex: 2,
    hint: "Flynn effect = the observed rise in IQ scores across generations in modernized countries (discovered by James Flynn)."
  },
  {
    id: 41, qNum: "Q.93",
    text: "One day I lost my earring. To keep from losing earrings further, I used thermocol to keep the earring in place. Using thermocol as a temporary earring back showed that I overcame the following:",
    options: ["Confirmation bias","A mental set","Functional fixedness","Transformation bias"],
    correctIndex: 2,
    hint: "Using an object (thermocol) for a function other than its usual function = overcoming functional fixedness."
  },
  {
    id: 42, qNum: "Q.94",
    text: "Sense organs in the muscles, tendons and joints tell us about the position of our limbs and the state of tension in the muscles. They serve the sense called:",
    options: ["Reflector","Kinesthesis","Simulation","Transduction"],
    correctIndex: 1,
    hint: "Information about limb position and muscle tension = kinesthetic sense (proprioception/kinesthesis)."
  },
  {
    id: 43, qNum: "Q.95",
    text: "Match List-I with List-II.\n\nList-I:\nA. Kaivalya\nB. Asuya\nC. Buddhi\nD. Tarka\n\nList-II:\nI. Intellect\nII. Reasoning\nIII. Self-realization\nIV. Jealousy\n\nChoose the correct answer:",
    options: ["A-I, B-IV, C-II, D-III","A-I, B-II, C-III, D-IV","A-III, B-IV, C-I, D-II","A-III, B-I, C-IV, D-II"],
    correctIndex: 2,
    hint: "Kaivalya → liberation/self-realization (III); Asuya → jealousy (IV); Buddhi → intellect (I); Tarka → reasoning (II)."
  },
  {
    id: 44, qNum: "Q.96",
    text: "Which factors influence encoding into long-term memory?\n\nA. Attention at the time of learning\nB. Emotional salience of the material\nC. Repetition alone, regardless of meaning\nD. Use of retrieval cues during learning\n\nChoose the correct answer:",
    options: ["A, B and C Only","A and C Only","A and B Only","A and D Only"],
    correctIndex: 2,
    hint: "Good encoding depends strongly on attention (A) and meaningful/emotional processing (B). Repetition alone without meaning (C) is not sufficient."
  },
  {
    id: 45, qNum: "Q.97",
    text: "Match List-I with List-II.\n\nTheories — Psychologists:\nA. Correspondent Inference\nB. Covariation Theory\nC. Planned Behaviour\nD. Social Comparison\n\nList-II:\nI. Kelley\nII. Ajzen & Fishbein\nIII. Festinger\nIV. Jones & Davis\n\nChoose the correct answer:",
    options: ["A-I, B-IV, C-III, D-II","A-I, B-II, C-III, D-IV","A-IV, B-III, C-I, D-II","A-IV, B-I, C-II, D-III"],
    correctIndex: 3,
    hint: "Correspondent inference → Jones & Davis (IV); Covariation → Kelley (I); Planned behaviour → Ajzen & Fishbein (II); Social comparison → Festinger (III)."
  },
  {
    id: 46, qNum: "Q.98",
    text: "Guilford's theory of intelligence, known as the cubical model of intelligence, consists of 120 small cubes representing primary abilities that are some combination of operations, products and contents. Which one of the following is included in the product dimension?",
    options: ["Evaluation","Convergent Production","Memory","Transformations"],
    correctIndex: 3,
    hint: "Guilford's product dimension includes: units, classes, relations, systems, transformations, and implications. Operations include evaluation, convergent/divergent production, memory, cognition."
  },
  {
    id: 47, qNum: "Q.99",
    text: "The correct sequence for engagement in pro-social behaviour as suggested by Latane and Darley (1970):\n\nA. Notice that something unusual is happening\nB. Decide that you have the knowledge or skills needed to help\nC. Decide to actually help\nD. Interpret the event as an emergency\nE. Accept responsibility for helping\n\nChoose the correct answer:",
    options: ["D, A, B, C, E","D, A, C, B, E","A, D, E, B, C","A, D, B, C, E"],
    correctIndex: 2,
    hint: "Latane & Darley: Notice unusual (A) → Interpret as emergency (D) → Accept responsibility (E) → Assess ability to help (B) → Actually help (C)."
  },
  {
    id: 48, qNum: "Q.100",
    text: "Teenays has low self-esteem and high interpersonal trust. She will show which attachment style?",
    options: ["Pre-occupied","Fearful-avoidant","Dismissing","Secure"],
    correctIndex: 0,
    hint: "Attachment: Low self-model + Positive other-model = Preoccupied. Low self-esteem + high trust fits this pattern."
  },
  {
    id: 49, qNum: "Q.101",
    text: "Match List-I with List-II.\n\nList-I:\nA. Abraham Maslow\nB. McClelland\nC. Herzberg\nD. Vroom\n\nList-II:\nI. Achievement, affiliation, power motives\nII. Expectancy-Valence model\nIII. Hierarchy of needs\nIV. Two-factor theory (Hygiene & Motivators)\n\nChoose the correct answer:",
    options: ["A-IV, B-II, C-III, D-I","A-III, B-I, C-IV, D-II","A-II, B-IV, C-I, D-III","A-I, B-III, C-II, D-IV"],
    correctIndex: 1,
    hint: "Maslow = hierarchy of needs (III); McClelland = achievement/affiliation/power (I); Herzberg = hygiene/motivators (IV); Vroom = expectancy-valence (II)."
  },
  {
    id: 50, qNum: "Q.102",
    text: "Which of the following levels of functioning in the 'citta' is considered the central processor?",
    options: ["Buddhi","Manas","Ahankara","Vasana"],
    correctIndex: 1,
    hint: "In the citta model, manas functions as the central coordinating/processing mind (receiving sensory input and coordinating responses)."
  },
  {
    id: 51, qNum: "Q.103",
    text: "Match List-I with List-II.\n\nList-I:\nA. Dialectical Behaviour Therapy\nB. Reality Therapy\nC. Existential Psycho Therapy\nD. Solution Focused Therapy\n\nList-II:\nI. Glasser\nII. Kierkegaard\nIII. Marsha Linehan\nIV. Shazer\n\nChoose the correct answer:",
    options: ["A-III, B-I, C-IV, D-II","A-IV, B-III, C-II, D-I","A-III, B-I, C-II, D-IV","A-II, B-III, C-I, D-IV"],
    correctIndex: 2,
    hint: "DBT → Marsha Linehan (III); Reality therapy → William Glasser (I); Existential → Kierkegaard (II); Solution-focused → de Shazer (IV)."
  },
  {
    id: 52, qNum: "Q.104",
    text: "The limb (anga), which signifies concentration according to Yog-sutra is:",
    options: ["Dhyana","Dharana","Samadhi","Pranayam"],
    correctIndex: 1,
    hint: "Patanjali's Ashtanga: Dharana = concentration; Dhyana = meditation; Samadhi = absorption/enlightenment."
  },
  {
    id: 53, qNum: "Q.105",
    text: "The two genes that control the same trait are called:",
    options: ["Homozygous","Alleles","Heterozygous","Genetic recombination"],
    correctIndex: 1,
    hint: "Different forms of the same gene at the same locus are called alleles. Homozygous/heterozygous describes whether they are the same or different."
  },
  {
    id: 54, qNum: "Q.106",
    text: "Match List-I with List-II.\n\nList-I:\nA. Law of proximity\nB. Law of similarity\nC. Law of closure\nD. Law of figure-ground\n\nList-II:\nI. We group close to each other together\nII. Perceiving familiar shapes even when incomplete\nIII. Distinguishing object from background\nIV. Grouping similar items together in perception\n\nChoose the correct answer:",
    options: ["A-IV, B-II, C-III, D-I","A-I, B-III, C-II, D-IV","A-I, B-IV, C-II, D-III","A-II, B-I, C-IV, D-III"],
    correctIndex: 2,
    hint: "Proximity → close things grouped (I); Similarity → similar things grouped (IV); Closure → incomplete forms completed (II); Figure-ground → object from background (III)."
  },
  {
    id: 55, qNum: "Q.107",
    text: "Which of the following best describes eudaimonic well-being?",
    options: [
      "Achievement of financial stability",
      "Living in accordance with one's values and realizing potential",
      "Pursuit of pleasure and avoidance of pain",
      "Reduction of stress through lifestyle changes"
    ],
    correctIndex: 1,
    hint: "Eudaimonic well-being = meaning, values, purpose and realization of potential (vs. hedonic = pleasure). Aristotle's concept of flourishing."
  },
  {
    id: 56, qNum: "Q.108",
    text: "Given below are two statements:\n\nAssertion (A): Health Psychology interventions are limited only to clinical treatment of patients.\nReason (R): They focus on prevention, promotion of healthy behaviour and improving quality of life.\n\nChoose the most appropriate answer:",
    options: [
      "Both (A) and (R) are correct and (R) is the correct explanation of (A).",
      "Both (A) and (R) are correct but (R) is not the correct explanation of (A).",
      "(A) is correct but (R) is not correct.",
      "(A) is not correct but (R) is correct."
    ],
    correctIndex: 3,
    hint: "Health psychology is much broader than clinical treatment (A is wrong). The Reason correctly describes the broader scope: prevention + promotion + quality of life."
  },
  {
    id: 57, qNum: "Q.109",
    text: "Two dorsal arms of the spinal gray matter are called:\n\nA. Dorsal root ganglia\nB. Dorsal horn\nC. Basal ganglia\nD. Ventral horns\n\nChoose the correct answer:",
    options: ["A and B Only","A and C Only","A and D Only","B and D Only"],
    correctIndex: 3,
    hint: "The posterior/dorsal projections of spinal grey matter are the dorsal horns; ventral horns are the anterior projections. So the two arms = dorsal horn (B) + ventral horn (D)."
  },
  {
    id: 58, qNum: "Q.110",
    text: "Which of the following tactics of compliance is based upon Commitment or Consistency?",
    options: ["Ingratiation","Door-in-the-face technique","Low-ball pressure","Deadline technique"],
    correctIndex: 2,
    hint: "Low-ball technique exploits commitment and consistency: get agreement first, then reveal the less favorable terms. People honor initial commitments."
  },
  {
    id: 59, qNum: "Q.111",
    text: "What are the three distinct types of intelligence by Sternberg?\n\nA. Progressive Intelligence\nB. Componential Intelligence\nC. Experiential Intelligence\nD. Contextual Intelligence\nE. Exponential Intelligence\n\nChoose the correct answer:",
    options: ["A, C, D Only","B, C, E Only","B, C, D Only","C, D, E Only"],
    correctIndex: 2,
    hint: "Sternberg's triarchic theory: Componential/analytical (B) + Experiential/creative (C) + Contextual/practical (D) intelligence."
  },
  {
    id: 60, qNum: "Q.112",
    text: "According to Panchkosha Theory, what is the correct sequence?\n\nA. Vijnanamaya Kosha\nB. Annamaya Kosha\nC. Manomaya Kosha\nD. Pranamaya Kosha\nE. Anandamaya Kosha\n\nChoose the correct answer:",
    options: ["C, D, A, E, B","B, D, C, A, E","C, B, E, A, D","C, E, A, B, D"],
    correctIndex: 1,
    hint: "Panchakosha moves from grossest to most subtle: Annamaya (B) → Pranamaya (D) → Manomaya (C) → Vijnanamaya (A) → Anandamaya (E)."
  },
  {
    id: 61, qNum: "Q.113",
    text: "Match List-I with List-II.\n\nList-I:\nA. Availability heuristic\nB. Representativeness heuristic\nC. Anchoring-and-Adjustment heuristic\nD. Framing\n\nList-II:\nI. Presentation of information concerning potential outcomes\nII. Reference points that may lead us for problem solving\nIII. What comes to mind first\nIV. Assuming that what is typical is also likely the solution\n\nChoose the correct answer:",
    options: ["A-I, B-III, C-II, D-IV","A-II, B-III, C-I, D-IV","A-III, B-IV, C-II, D-I","A-IV, B-II, C-III, D-I"],
    correctIndex: 2,
    hint: "Availability → what comes to mind (III); Representativeness → what is typical (IV); Anchoring → reference point (II); Framing → presentation of outcomes (I)."
  }
];

export const TOTAL_QUESTIONS = questions.length; // 61
