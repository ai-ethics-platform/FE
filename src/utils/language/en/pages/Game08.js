export const Game08 = {
  subtopic: "Results: Our Choice",

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
      default: "Your decisions helped the home robot provide more accurate services."
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
      default: "A variety of services are now provided for children nationwide, \n and the home robot's algorithms have been made transparent."
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
      default: "The world has slowed technological progress slightly, but continues moving forward for the environment and the future."
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
      default: "Your decisions have brought the autonomous weapon system to a turning point."
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
      default:  "Discussions are continuing at the national level."
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
      default: "The world is now exploring a new security order shaped by each choice."
    },
    p4: "The values you chose came together to create one possible future.\nAre you ready to live in the future you helped shape?"
  },

  buttons: {
    future: "Explore other’s future",
    exit: "Exit"
  }
};