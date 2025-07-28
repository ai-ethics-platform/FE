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
      'mataName',
      'nickname',
      'title',
      'completedTopics',
      'session_id',
      'selectedCharacterIndex',
      'currentRound',
      'subtopicResults',
    ];
  
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  }
  