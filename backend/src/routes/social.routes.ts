import { Router, type Router as ExpressRouter } from 'express';
import * as socialController from '../controllers/social.controller';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { updateSocialPrivacySchema } from '../utils/validators';

const router: ExpressRouter = Router();

router.use(authenticate);
router.put('/privacy', validateBody(updateSocialPrivacySchema), socialController.updatePrivacy);
router.get('/feed', socialController.getFeed);
router.post('/follows/:userId', socialController.followUser);
router.delete('/follows/:userId', socialController.unfollowUser);
router.post('/feed/:feedItemId/kudos', socialController.addKudos);
router.delete('/feed/:feedItemId/kudos', socialController.removeKudos);
router.get('/challenges/weekly', socialController.getWeeklyChallenge);
router.post('/challenges/:challengeId/join', socialController.joinChallenge);
router.get('/challenges/:challengeId/leaderboard', socialController.getChallengeLeaderboard);

export default router;
