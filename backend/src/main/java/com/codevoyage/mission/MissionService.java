package com.codevoyage.mission;

import com.codevoyage.challenge.CodingChallenge;
import com.codevoyage.challenge.TestCase;
import com.codevoyage.challenge.dto.CodingChallengeDTO;
import com.codevoyage.challenge.dto.HintDTO;
import com.codevoyage.challenge.dto.TestCaseDTO;
import com.codevoyage.exception.ResourceNotFoundException;
import com.codevoyage.lesson.dto.LessonDTO;
import com.codevoyage.mission.dto.MissionDetailDTO;
import com.codevoyage.mission.dto.MissionSummaryDTO;
import com.codevoyage.practice.dto.PracticeQuestionDTO;
import com.codevoyage.progress.UserProgress;
import com.codevoyage.progress.UserProgressRepository;
import com.codevoyage.user.User;
import com.codevoyage.user.UserRepository;
import com.codevoyage.world.World;
import com.codevoyage.world.WorldRepository;
import com.codevoyage.world.dto.WorldDTO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class MissionService {

    private final WorldRepository worldRepository;
    private final MissionRepository missionRepository;
    private final UserProgressRepository userProgressRepository;
    private final UserRepository userRepository;

    public MissionService(
            WorldRepository worldRepository,
            MissionRepository missionRepository,
            UserProgressRepository userProgressRepository,
            UserRepository userRepository
    ) {
        this.worldRepository = worldRepository;
        this.missionRepository = missionRepository;
        this.userProgressRepository = userProgressRepository;
        this.userRepository = userRepository;
    }

    public List<WorldDTO> getAllWorldsWithProgress(String username) {
        User user = (username != null) ? userRepository.findByUsername(username).orElse(null) : null;
        Map<Long, UserProgress> progressMap = new HashMap<>();

        if (user != null) {
            userProgressRepository.findByUserId(user.getId())
                    .forEach(up -> progressMap.put(up.getMission().getId(), up));
        }

        List<World> worlds = worldRepository.findAll().stream()
                .sorted(Comparator.comparingInt(World::getWorldOrder))
                .collect(Collectors.toList());
        return worlds.stream()
                .map(world -> mapWorldToDTO(world, progressMap, user))
                .collect(Collectors.toList());
    }

    public MissionDetailDTO getMissionDetails(Long missionId, String username) {
        Mission mission = missionRepository.findById(missionId)
                .orElseThrow(() -> new ResourceNotFoundException("Mission not found with id: " + missionId));

        User user = (username != null) ? userRepository.findByUsername(username).orElse(null) : null;
        UserProgress userProgress = null;

        if (user != null) {
            userProgress = userProgressRepository.findByUserIdAndMissionId(user.getId(), mission.getId())
                    .orElse(null);
        }

        return mapMissionToDetailDTO(mission, userProgress, user);
    }

    private WorldDTO mapWorldToDTO(World world, Map<Long, UserProgress> progressMap, User user) {
        boolean isWorldUnlocked = Boolean.TRUE.equals(world.getUnlockedByDefault())
                || (user != null && user.getCurrentSector() != null && user.getCurrentSector() >= world.getWorldOrder());

        List<MissionSummaryDTO> missionDTOs = world.getMissions().stream()
                .map(m -> {
                    UserProgress up = progressMap.get(m.getId());
                    boolean isUnlocked = (up != null && Boolean.TRUE.equals(up.getUnlocked()))
                            || (m.getMissionOrder() == 1 && isWorldUnlocked);
                    boolean isCompleted = up != null && Boolean.TRUE.equals(up.getCompleted());
                    int stars = up != null ? up.getStars() : 0;

                    return new MissionSummaryDTO(
                            m.getId(),
                            m.getMissionOrder(),
                            m.getTitle(),
                            m.getSlug(),
                            m.getObjective(),
                            m.getJavaConcept(),
                            m.getXpReward(),
                            m.getStarsReward(),
                            m.getDifficulty(),
                            isUnlocked,
                            isCompleted,
                            stars
                    );
                })
                .collect(Collectors.toList());

        return new WorldDTO(
                world.getId(),
                world.getWorldOrder(),
                world.getSlug(),
                world.getName(),
                world.getTheme(),
                world.getLore(),
                isWorldUnlocked,
                missionDTOs
        );
    }

    private MissionDetailDTO mapMissionToDetailDTO(Mission mission, UserProgress progress, User user) {
        MissionDetailDTO dto = new MissionDetailDTO();
        dto.setId(mission.getId());
        dto.setWorldId(mission.getWorld().getId());
        dto.setWorldName(mission.getWorld().getName());
        dto.setMissionOrder(mission.getMissionOrder());
        dto.setTitle(mission.getTitle());
        dto.setSlug(mission.getSlug());
        dto.setStory(mission.getStory());
        dto.setObjective(mission.getObjective());
        dto.setJavaConcept(mission.getJavaConcept());
        dto.setShipSystem(mission.getShipSystem());
        dto.setXpReward(mission.getXpReward());
        dto.setStarsReward(mission.getStarsReward());
        dto.setDifficulty(mission.getDifficulty());
        dto.setIsBossMission(Boolean.TRUE.equals(mission.getIsBossMission()));
        dto.setUnlockRequirementMissionId(mission.getUnlockRequirementMissionId());

        boolean isWorldUnlocked = Boolean.TRUE.equals(mission.getWorld().getUnlockedByDefault())
                || (user != null && user.getCurrentSector() != null && user.getCurrentSector() >= mission.getWorld().getWorldOrder());

        boolean unlocked = (progress != null && Boolean.TRUE.equals(progress.getUnlocked()))
                || (mission.getMissionOrder() == 1 && isWorldUnlocked);

        dto.setUnlocked(unlocked);
        dto.setCompleted(progress != null && Boolean.TRUE.equals(progress.getCompleted()));
        dto.setStarsEarned(progress != null ? progress.getStars() : 0);
        dto.setAttempts(progress != null ? progress.getAttempts() : 0);
        dto.setHintsUsed(progress != null ? progress.getHintsUsed() : 0);

        // Map Lesson
        if (mission.getLesson() != null) {
            LessonDTO lDto = new LessonDTO(
                    mission.getLesson().getId(),
                    mission.getLesson().getTitle(),
                    mission.getLesson().getConceptSummary(),
                    mission.getLesson().getDetailedExplanation(),
                    mission.getLesson().getSampleJavaCode(),
                    mission.getLesson().getKeyTakeaways()
            );
            lDto.setWhyNeeded(mission.getLesson().getWhyNeeded());
            lDto.setVisualRepJson(mission.getLesson().getVisualRepJson());
            lDto.setSyntaxBreakdownJson(mission.getLesson().getSyntaxBreakdownJson());
            lDto.setCommonMistakesJson(mission.getLesson().getCommonMistakesJson());
            lDto.setInteractiveSnippet(mission.getLesson().getInteractiveSnippet());
            lDto.setInteractiveOptionsJson(mission.getLesson().getInteractiveOptionsJson());
            dto.setLesson(lDto);
        }

        // Map Practice Questions
        if (mission.getPracticeQuestions() != null) {
            dto.setPracticeQuestions(mission.getPracticeQuestions().stream()
                    .map(pq -> {
                        PracticeQuestionDTO qDto = new PracticeQuestionDTO(
                                pq.getId(),
                                pq.getQuestionNumber(),
                                pq.getPrompt(),
                                pq.getCodeSnippet(),
                                pq.getOptionsJson(),
                                pq.getCorrectAnswerIndex(),
                                pq.getExplanation()
                        );
                        qDto.setActivityType(pq.getActivityType() != null ? pq.getActivityType() : "MULTIPLE_CHOICE");
                        qDto.setActivityDataJson(pq.getActivityDataJson());
                        qDto.setHint(pq.getHint());
                        return qDto;
                    })
                    .collect(Collectors.toList()));
        }

        // Map Coding Challenge (STRICT SECURITY RULE: EXCLUDE HIDDEN TEST CASES)
        if (mission.getCodingChallenge() != null) {
            CodingChallenge cc = mission.getCodingChallenge();

            // Filter ONLY visible tests
            List<TestCaseDTO> visibleTests = cc.getTestCases().stream()
                    .filter(tc -> !Boolean.TRUE.equals(tc.getHidden()))
                    .map(tc -> new TestCaseDTO(tc.getId(), tc.getInput(), tc.getExpectedOutput(), tc.getDescription()))
                    .collect(Collectors.toList());

            List<HintDTO> hintDTOs = cc.getHints().stream()
                    .map(h -> new HintDTO(h.getId(), h.getHintOrder(), h.getContent(), h.getXpPenalty()))
                    .collect(Collectors.toList());

            dto.setCodingChallenge(new CodingChallengeDTO(
                    cc.getId(),
                    cc.getTitle(),
                    cc.getInstructions(),
                    cc.getStarterCode(),
                    cc.getMethodSignature(),
                    visibleTests,
                    hintDTOs
            ));
        }

        return dto;
    }
}
