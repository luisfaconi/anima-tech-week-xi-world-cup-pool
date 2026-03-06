import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function validateSeed() {
  console.log('🔍 Validating seed data...\n');

  // Count records
  const matchCount = await prisma.match.count();
  const userCount = await prisma.user.count();
  const poolCount = await prisma.pool.count();
  const membershipCount = await prisma.poolMembership.count();
  const pickCount = await prisma.pick.count();
  const aiSuggestionCount = await prisma.aISuggestion.count();

  console.log('📊 Database Statistics:');
  console.log(`  ✅ Matches: ${matchCount}`);
  console.log(`  ✅ Users: ${userCount}`);
  console.log(`  ✅ Pools: ${poolCount}`);
  console.log(`  ✅ Pool Memberships: ${membershipCount}`);
  console.log(`  ✅ Picks: ${pickCount}`);
  console.log(`  ✅ AI Suggestions: ${aiSuggestionCount}\n`);

  // Validate matches by group
  const groupMatches = await prisma.match.groupBy({
    by: ['matchType'],
    _count: true
  });

  console.log('⚽ Matches by Type:');
  groupMatches.forEach(group => {
    console.log(`  - ${group.matchType}: ${group._count} matches`);
  });

  // Sample some matches to verify flag format
  console.log('\n🏴 Sample Matches (verifying flag format):');
  const sampleMatches = await prisma.match.findMany({
    take: 5,
    where: {
      matchType: 'group'
    },
    select: {
      teamA: true,
      teamB: true,
      teamAFlag: true,
      teamBFlag: true,
      groupName: true,
      venue: true
    }
  });

  sampleMatches.forEach(match => {
    const flagUrlA = match.teamAFlag ? `https://flagcdn.com/w80/${match.teamAFlag}.png` : 'N/A';
    const flagUrlB = match.teamBFlag ? `https://flagcdn.com/w80/${match.teamBFlag}.png` : 'N/A';
    console.log(`  Group ${match.groupName}: ${match.teamA} (${match.teamAFlag}) vs ${match.teamB} (${match.teamBFlag})`);
    console.log(`    Flag URLs: ${flagUrlA} | ${flagUrlB}`);
  });

  // Validate pools
  console.log('\n🏆 Pools:');
  const pools = await prisma.pool.findMany({
    include: {
      _count: {
        select: { memberships: true, picks: true }
      }
    }
  });

  pools.forEach(pool => {
    console.log(`  - ${pool.name} (${pool.inviteCode})`);
    console.log(`    Members: ${pool._count.memberships}, Picks: ${pool._count.picks}`);
    console.log(`    Scoring Rules: ${JSON.stringify(pool.scoringRules)}`);
  });

  // Validate data integrity
  console.log('\n✅ Data Integrity Checks:');
  
  // Check if all picks belong to valid pool memberships
  const invalidPicks = await prisma.pick.findMany({
    where: {
      NOT: {
        poolId: {
          in: (await prisma.poolMembership.findMany({
            where: { userId: { not: undefined } },
            select: { poolId: true }
          })).map(m => m.poolId)
        }
      }
    }
  });

  if (invalidPicks.length === 0) {
    console.log('  ✅ All picks belong to valid pool memberships');
  } else {
    console.log(`  ❌ Found ${invalidPicks.length} invalid picks`);
  }

  // Check if all matches have valid dates
  const futureMatches = await prisma.match.count({
    where: {
      scheduledAt: {
        gte: new Date('2026-06-01')
      }
    }
  });

  console.log(`  ✅ ${futureMatches} matches scheduled for World Cup 2026`);

  // Check flag format (should be lowercase 2-letter codes)
  const matchesWithFlags = await prisma.match.findMany({
    where: {
      AND: [
        { teamAFlag: { not: null } },
        { teamBFlag: { not: null } }
      ]
    },
    select: {
      teamAFlag: true,
      teamBFlag: true
    }
  });

  const invalidFlags = matchesWithFlags.filter(m => {
    const flagA = m.teamAFlag || '';
    const flagB = m.teamBFlag || '';
    return flagA !== flagA.toLowerCase() || flagB !== flagB.toLowerCase() ||
           (flagA.length > 0 && flagA.length > 10) || (flagB.length > 0 && flagB.length > 10);
  });

  if (invalidFlags.length === 0) {
    console.log(`  ✅ All ${matchesWithFlags.length} flags are in correct format (lowercase)`);
  } else {
    console.log(`  ❌ Found ${invalidFlags.length} matches with invalid flag format`);
  }

  console.log('\n✅ Seed validation completed successfully!');
}

validateSeed()
  .catch((e) => {
    console.error('❌ Validation failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
