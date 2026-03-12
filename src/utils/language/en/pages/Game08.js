export const Game08 = {
  subtopic: "Result: Our Choice",

  android: {
    p1: {
      full: {
        intro: "Through your decisions, household robots ",
        opt1: { agree: "now provide more accurate services", disagree: "now provide safer services" },
        mid: " and fulfill their roles ",
        opt2: { agree: "like trusted companions.", disagree: "as assistive tools for you." },
        end: ""
      },
      partial: {
        intro: "Through your decisions, household robots ",
        opt1: { agree: "now provide more accurate services.", disagree: "now provide safer services." },
        end: ""
      },
      default: "여러분의 결정으로 가정용 로봇은 보다 정확한 서비스를 제공하였습니다.(미번역)"
    },
    p2: {
      full: {
        intro: "Within the nation, ",
        opt1: { agree: "limited services", disagree: "a wide range of services" },
        mid: " are provided for children, and the algorithms of household robots have ",
        opt2: { 
          agree: "been disclosed transparently.", 
          disagree: "rapidly advanced under corporate protection." 
        },
        end: ""
      },
      partial: {
        intro: "Within the nation, ",
        opt1: { agree: "limited services", disagree: "a wide range of services" },
        end: " have come to be provided for children."
      },
      default: "국가 내에서는 아이들을 위해 다양한 서비스를 제공하며, \n 가정용 로봇의 알고리즘은 투명하게 공개되었습니다.(미번역)"
    },
    p3: {
      played: {
        intro: "And now, the world is moving forward—",
        opt: { 
          agree: "having slowed technological progress slightly, but doing so for the sake of the environment and the future", 
          disagree: "enjoying technological convenience and progressing at an increasingly rapid pace" 
        },
        end: "."
      },
      default: "그리고 세계는 지금, 기술적 발전을 조금 늦추었지만 환경과 미래를 위해 \n나아가고 있죠.(미번역)"
    },
    p4: "The values you chose have come together to create a single future.\nAre you ready to be part of that future?"
  },

  aws: {
    p1: {
      full: {
        intro: "Because of your decisions, ",
        opt1: { agree: "autonomous weapon systems have become safer", disagree: "responsibility for autonomous weapon systems has become clearer" },
        mid: ", and with ",
        opt2: { 
          agree: "expanded authority, AWS is now fully carrying out its role as your teammate.", 
          disagree: "their authority limited, AWS fulfills its role as a support tool for humans." 
        },
        end: ""
      },
      partial: {
        intro: "Because of your decisions, ",
        opt1: { agree: "autonomous weapon systems have become safer.", disagree: "responsibility for autonomous weapon systems has become clearer." },
        end: ""
      },
      default: "여러분의 결정으로 자율 무기 시스템은 변화의 기점에 서 있습니다.(미번역)"
    },
    p2: {
      full: {
        intro: "At the national level, war is ",
        opt1: { 
          agree: "increasingly being fought only between AWS", 
          disagree: "still involving human soldiers" 
        },
        mid: ", and discussions are ongoing about whether rights ",
        opt2: { agree: "can be granted to autonomous weapon systems.", disagree: "cannot be granted to autonomous weapon systems." },
        end: ""
      },
      partial: {
        intro: "At the national level, war is ",
        opt1: { 
          agree: "increasingly being fought only between AWS.", 
          disagree: "still involving human soldiers." 
        },
        end: ""
      },
      default: "국가 차원에서도 여러 논의가 이어지고 있습니다.(미번역)"
    },
    p3: {
      played: {
        intro: "And around the world, ",
        opt: { 
          agree: "AWS is being rapidly developed through global competition.", 
          disagree: "alternative security technologies using AI instead of AWS are being explored." 
        },
        end: ""
      },
      default: "그리고 세계는, 각자의 선택에 따라 새로운 안보 질서를 모색하고 있죠.(미번역)"
    },
    p4: "The values you chose came together to create one possible future.\nAre you ready to live in the future you helped shape?"
  },

  buttons: {
    future: "Explore other’s future",
    exit: "Exit"
  }
};