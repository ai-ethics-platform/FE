export function clearAllLocalStorageKeys() {
    const keysToRemove = [
      'myrole_id',
      'host_id',
      'user_id',
      'role1_user_id',
      'role2_user_id',
      'role3_user_id',
      'room_code',
      'category',
      'subtopic',
      'mode',
      'access_token',
      'refresh_token',
      'mateName',
      'nickname',
      'title',
      'completedTopics',
      'session_id',
      'selectedCharacterIndex',
      'currentRound',
      'subtopicResults',
      'dilemma_image_url_1',   'dilemma_image_url_3',   'dilemma_image_url_4_1',   'dilemma_image_url_4_2',
      'creatorTitle','code','finalText','debug_raw_finalText',
      'opening','char1','char2','char3','charDes1','charDes2','charDes3','dilemma_situation','question','flips_agree_texts','flips_disagree_texts','agreeEnding','disagreeEnding','choice1','choice2',
      'dilemma_image_1','dilemma_image_3','dilemma_image_4_1','dilemma_image_4_2',
      'role_image_1','role_image_2','role_image_3'
    ];
  
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  }
  