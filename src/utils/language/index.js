// --- 한국어(ko) 데이터 임포트 ---
import { Login as LoginKo } from './ko/pages/Login';
import { Signup01 as Signup01Ko } from './ko/pages/Signup01';
import { Signup02 as Signup02Ko } from './ko/pages/Signup02';
import { SelectRoom as SelectRoomKo } from './ko/pages/SelectRoom';
import { WaitingRoom as WaitingRoomKo } from './ko/pages/WaitingRoom';
import { GameIntro as GameIntroKo } from './ko/pages/GameIntro';
import { SelectHomeMate as SelectHomeMateKo } from './ko/pages/SelectHomeMate';
import { MateName as MateNameKo } from './ko/pages/MateName';
import { GameMap as GameMapKo } from './ko/pages/GameMap';
import { Game01 as Game01Ko } from './ko/pages/Game01';
import { CharacterDescription as CharacterDescriptionKo } from './ko/pages/CharacterDescription';
import { Game03 as Game03Ko } from './ko/pages/Game03';
import { Game04 as Game04Ko } from './ko/pages/Game04';
import { Game05_1 as Game05_1Ko } from './ko/pages/Game05_1';
import { Game08 as Game08Ko } from './ko/pages/Game08';
import { Game09 as Game09KoData } from './ko/pages/Game09';

import { CreateRoom as CreateRoomKo } from './ko/components/CreateRoom';
import { JoinRoom as JoinRoomKo } from './ko/components/JoinRoom';
import { LogoutPopup as LogoutPopupKo } from './ko/components/LogoutPopup';
import { OutPopup as OutPopupKo } from './ko/components/OutPopup';
import { SelectDrop as SelectDropKo } from './ko/components/SelectDrop';
import { CancelReadyPopup as CancelReadyPopupKo } from './ko/components/CancelReadyPopup';
import { MicTestPopup as MicTestPopupKo } from './ko/components/MicTestPopup';
import { FindIdModal as FindIdModalKo } from './ko/components/FindIdModal';
import { SmallDescription as SmallDescriptionKo } from './ko/components/SmallDescription';
import { Paragraphs as ParagraphsKo } from './ko/components/Paragraphs';
import { UiElements as UiElementsKo } from './ko/components/UiElements';
import { ResultPopup as ResultPopupKo } from './ko/components/ResultPopup';
import { GuestLogin as koGuestLogin } from './ko/components/GuestLogin';

// --- 영어(en) 데이터 임포트 ---
import { Login as LoginEn } from './en/pages/Login';
import { Signup01 as Signup01En } from './en/pages/Signup01';
import { Signup02 as Signup02En } from './en/pages/Signup02';
import { SelectRoom as SelectRoomEn } from './en/pages/SelectRoom';
import { WaitingRoom as WaitingRoomEn } from './en/pages/WaitingRoom';
import { GameIntro as GameIntroEn } from './en/pages/GameIntro';
import { SelectHomeMate as SelectHomeMateEn } from './en/pages/SelectHomeMate'; 
import { MateName as MateNameEn } from './en/pages/MateName';
import { GameMap as GameMapEn } from './en/pages/GameMap';
import { Game01 as Game01En } from './en/pages/Game01';
import { CharacterDescription as CharacterDescriptionEn } from './en/pages/CharacterDescription';
import { Game03 as Game03En } from './en/pages/Game03';
import { Game04 as Game04En } from './en/pages/Game04';
import { Game05_1 as Game05_1En } from './en/pages/Game05_1';
import { Game08 as Game08En } from './en/pages/Game08';
import { Game09 as Game09EnData } from './en/pages/Game09'

import { CreateRoom as CreateRoomEn } from './en/components/CreateRoom';
import { JoinRoom as JoinRoomEn } from './en/components/JoinRoom';
import { LogoutPopup as LogoutPopupEn } from './en/components/LogoutPopup';
import { OutPopup as OutPopupEn } from './en/components/OutPopup';
import { SelectDrop as SelectDropEn } from './en/components/SelectDrop';
import { CancelReadyPopup as CancelReadyPopupEn } from './en/components/CancelReadyPopup';
import { MicTestPopup as MicTestPopupEn } from './en/components/MicTestPopup';
import { FindIdModal as FindIdModalEn } from './en/components/FindIdModal';
import { SmallDescription as SmallDescriptionEn } from './en/components/SmallDescription';
import { Paragraphs as ParagraphsEn } from './en/components/Paragraphs';
import { UiElements as UiElementsEn } from './en/components/UiElements';
import { ResultPopup as ResultPopupEn } from './en/components/ResultPopup';
import { GuestLogin as enGuestLogin } from './en/components/GuestLogin';


// --- 다국어 데이터 객체 생성 ---
export const translations = {
  ko: {
    Login: LoginKo, Signup01: Signup01Ko, Signup02: Signup02Ko, SelectRoom: SelectRoomKo,
    CreateRoom: CreateRoomKo, JoinRoom: JoinRoomKo, LogoutPopup: LogoutPopupKo, WaitingRoom: WaitingRoomKo,
    OutPopup: OutPopupKo, SelectDrop: SelectDropKo, CancelReadyPopup: CancelReadyPopupKo,
    MicTestPopup: MicTestPopupKo, GameIntro: GameIntroKo, SelectHomeMate: SelectHomeMateKo,
    MateName: MateNameKo, FindIdModal: FindIdModalKo, GameMap: GameMapKo, Game01: Game01Ko,
    CharacterDescription: CharacterDescriptionKo, SmallDescription: SmallDescriptionKo,
    Paragraphs: ParagraphsKo, Game03: Game03Ko, UiElements: UiElementsKo, Game04: Game04Ko,
    Game05_1: Game05_1Ko, Game08: Game08Ko, Game09: Game09KoData,
    ResultPopup: ResultPopupKo, GuestLogin: koGuestLogin, // ko 객체에 추가
  },

  en: {
    Login: LoginEn, Signup01: Signup01En, Signup02: Signup02En, SelectRoom: SelectRoomEn,
    CreateRoom: CreateRoomEn, JoinRoom: JoinRoomEn, LogoutPopup: LogoutPopupEn, WaitingRoom: WaitingRoomEn,
    OutPopup: OutPopupEn, SelectDrop: SelectDropEn, CancelReadyPopup: CancelReadyPopupEn,
    MicTestPopup: MicTestPopupEn, GameIntro: GameIntroEn, SelectHomeMate: SelectHomeMateEn,
    MateName: MateNameEn, FindIdModal: FindIdModalEn, GameMap: GameMapEn, Game01: Game01En,
    CharacterDescription: CharacterDescriptionEn, SmallDescription: SmallDescriptionEn,
    Paragraphs: ParagraphsEn, Game03: Game03En, UiElements: UiElementsEn, Game04: Game04En,
    Game05_1: Game05_1En, Game08: Game08En, Game09: Game09EnData,
    ResultPopup: ResultPopupEn, GuestLogin: enGuestLogin, // en 객체에 추가
  } 
};