import {field,fail} from '../lib/server.ts';
import {validateIntroductionProfile} from './introduction-profile.mjs';
export const validateJoinProfile = p => validateIntroductionProfile(p,{field,fail});
