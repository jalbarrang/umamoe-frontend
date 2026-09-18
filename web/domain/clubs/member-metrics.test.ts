import { describe, expect, it } from 'vitest';
import { calculateMemberMetrics, clubProgression, effectiveMemberFans, memberDailyDeltas, type ClubMemberSnapshot } from './member-metrics';
import { clubExportCases, clubExportFixture } from '../../../tests/e2e/fixtures/club-exports';
import reference from '../../../tests/e2e/fixtures/club-exports-reference.json';

const member = (dailyFans: number[]): ClubMemberSnapshot => ({ viewer_id: 42, trainer_name: 'McQueen Trainer', membership: 3, year: 2026, month: 8, daily_fans: dailyFans, last_updated: '2026-08-20T00:00:00Z' });

describe('club member metrics', () => {
  it('matches captured Angular calculations and observed-day history across export cases', () => {
    for (const name of clubExportCases) {
      const fixture = clubExportFixture(name), expected = reference.cases[name].json;
      const actual = calculateMemberMetrics(fixture.response.members, { year: fixture.year, month: fixture.month, currentMonth: fixture.month === 9, includePrior: fixture.config.includePriorClubData, leaderViewerId: fixture.response.circle.leader_viewer_id });
      expect(actual.length).toBe(expected.members.length);
      for (const member of expected.members) expect(actual.find(value => String(value.viewerId) === member.trainer_id)).toEqual({
        viewerId: Number(member.trainer_id), name: member.name, role: member.role, fanCount: member.fan_count, active: member.isActive,
        todayGain: member.today_gain, dailyGain: member.daily_gain, monthlyGain: member.monthly_gain, weeklyGain: member.weekly_gain,
        sevenDayAverage: member.seven_day_avg, dailyAverage: member.daily_avg, projectedMonthly: member.projected_monthly,
        priorClubGain: member.priorCircleGain, priorInToday: member.priorInToday, priorInDaily: member.priorInDaily, priorInWeekly: member.priorInWeekly,
        hasPriorClubData: member.hasPriorCircleData, lastUpdated: member.last_updated
      });
      // Reference downloads use UTC; source history dates use the browser's local midnight.
      expect(clubProgression(fixture.response.members, fixture.year, fixture.month)).toEqual(expected.history.map(point => ({ ...point, date: new Date(fixture.year, fixture.month - 1, new Date(point.date).getUTCDate()).toISOString() })));
    }
  });

  it('retains role precedence, a first snapshot, and missing-month history fallback', () => {
    const source = { ...member([0, 0, 200]), membership: 1 };
    expect(calculateMemberMetrics([source], { year: 2026, month: 8, currentMonth: true, includePrior: true, leaderViewerId: 42 })[0]).toMatchObject({ role: 'member', todayGain: 200, dailyGain: 0, sevenDayAverage: 0 });
    expect(clubProgression([source], 2026, 9)).toEqual([{ date: new Date(2026, 8, 2).toISOString(), fan_count: 0 }]);
    expect(memberDailyDeltas(source, 31, true)).toEqual([null, null]);
  });

  it('separates the live current-day gain from the latest completed day', () => {
    const [result] = calculateMemberMetrics([member([100, 150, 230, 260])], { year: 2026, month: 8, currentMonth: true, includePrior: true, leaderViewerId: 42 });
    expect(result).toMatchObject({ role: 'leader', active: true, todayGain: 30, dailyGain: 80, monthlyGain: 160 });
  });

  it('can exclude prior-club snapshots from derived data', () => {
    const included = calculateMemberMetrics([member([-100, -150, 220, 300])], { year: 2026, month: 8, currentMonth: false, includePrior: true })[0];
    const excluded = calculateMemberMetrics([member([-100, -150, 220, 300])], { year: 2026, month: 8, currentMonth: false, includePrior: false })[0];
    expect(included?.hasPriorClubData).toBe(true);
    expect(included?.monthlyGain).toBe(200);
    expect(excluded?.monthlyGain).toBe(80);
  });

  it('aggregates club progression without leaking excluded prior-club data', () => {
    expect(clubProgression([member([-100, 150]), { ...member([50, 80]), viewer_id: 43 }], 2026, 8)).toEqual([{ date: new Date(2026, 7, 1).toISOString(), fan_count: 30 }]);
    expect(memberDailyDeltas(member([100, 140, 0, 210]), 31, true).slice(0, 3)).toEqual([40, null, 70]);
    expect(effectiveMemberFans({ ...member([100, 140]), next_month_start: 250 }, 3)).toEqual([100, 140, 0, 250]);
    expect(effectiveMemberFans({ ...member([100, 140, 0, 210]), next_month_start: 250 }, 3)).toEqual([100, 140, 0, 210]);
  });
});
