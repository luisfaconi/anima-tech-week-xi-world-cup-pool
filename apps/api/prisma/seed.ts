import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// World Cup 2026 Sample Data
const WORLD_CUP_MATCHES = [
  // Group Stage - Group A
  { teamA: 'Canada', teamB: 'Mexico', teamAFlag: 'CA', teamBFlag: 'MX', group: 'A', date: '2026-06-11T20:00:00Z', venue: 'BMO Field, Toronto' },
  { teamA: 'USA', teamB: 'Morocco', teamAFlag: 'US', teamBFlag: 'MA', group: 'A', date: '2026-06-12T17:00:00Z', venue: 'MetLife Stadium, New York' },
  { teamA: 'Canada', teamB: 'Morocco', teamAFlag: 'CA', teamBFlag: 'MA', group: 'A', date: '2026-06-16T14:00:00Z', venue: 'BC Place, Vancouver' },
  { teamA: 'USA', teamB: 'Mexico', teamAFlag: 'US', teamBFlag: 'MX', group: 'A', date: '2026-06-16T20:00:00Z', venue: 'SoFi Stadium, Los Angeles' },

  // Group Stage - Group B
  { teamA: 'Brazil', teamB: 'Argentina', teamAFlag: 'BR', teamBFlag: 'AR', group: 'B', date: '2026-06-13T17:00:00Z', venue: 'Mercedes-Benz Stadium, Atlanta' },
  { teamA: 'Spain', teamB: 'Germany', teamAFlag: 'ES', teamBFlag: 'DE', group: 'B', date: '2026-06-13T20:00:00Z', venue: 'Hard Rock Stadium, Miami' },
  { teamA: 'Brazil', teamB: 'Germany', teamAFlag: 'BR', teamBFlag: 'DE', group: 'B', date: '2026-06-17T17:00:00Z', venue: 'Gillette Stadium, Boston' },
  { teamA: 'Argentina', teamB: 'Spain', teamAFlag: 'AR', teamBFlag: 'ES', group: 'B', date: '2026-06-17T20:00:00Z', venue: 'Lincoln Financial Field, Philadelphia' },

  // Group Stage - Group C
  { teamA: 'France', teamB: 'Portugal', teamAFlag: 'FR', teamBFlag: 'PT', group: 'C', date: '2026-06-14T14:00:00Z', venue: 'Arrowhead Stadium, Kansas City' },
  { teamA: 'England', teamB: 'Netherlands', teamAFlag: 'GB', teamBFlag: 'NL', group: 'C', date: '2026-06-14T17:00:00Z', venue: 'Lumen Field, Seattle' },
  { teamA: 'France', teamB: 'Netherlands', teamAFlag: 'FR', teamBFlag: 'NL', group: 'C', date: '2026-06-18T14:00:00Z', venue: 'Soldier Field, Chicago' },
  { teamA: 'England', teamB: 'Portugal', teamAFlag: 'GB', teamBFlag: 'PT', group: 'C', date: '2026-06-18T17:00:00Z', venue: 'AT&T Stadium, Dallas' },

  // Round of 16 (Sample)
  { teamA: 'TBD', teamB: 'TBD', teamAFlag: null, teamBFlag: null, group: null, date: '2026-06-29T17:00:00Z', venue: 'MetLife Stadium, New York', type: 'round_16' },
  { teamA: 'TBD', teamB: 'TBD', teamAFlag: null, teamBFlag: null, group: null, date: '2026-06-29T20:00:00Z', venue: 'SoFi Stadium, Los Angeles', type: 'round_16' },

  // Quarter Finals (Sample)
  { teamA: 'TBD', teamB: 'TBD', teamAFlag: null, teamBFlag: null, group: null, date: '2026-07-09T17:00:00Z', venue: 'Mercedes-Benz Stadium, Atlanta', type: 'quarter' },
  { teamA: 'TBD', teamB: 'TBD', teamAFlag: null, teamBFlag: null, group: null, date: '2026-07-10T17:00:00Z', venue: 'Hard Rock Stadium, Miami', type: 'quarter' },

  // Semi Finals
  { teamA: 'TBD', teamB: 'TBD', teamAFlag: null, teamBFlag: null, group: null, date: '2026-07-14T20:00:00Z', venue: 'AT&T Stadium, Dallas', type: 'semi' },
  { teamA: 'TBD', teamB: 'TBD', teamAFlag: null, teamBFlag: null, group: null, date: '2026-07-15T20:00:00Z', venue: 'Mercedes-Benz Stadium, Atlanta', type: 'semi' },

  // Final
  { teamA: 'TBD', teamB: 'TBD', teamAFlag: null, teamBFlag: null, group: null, date: '2026-07-19T15:00:00Z', venue: 'MetLife Stadium, New York', type: 'final' }
];

const SAMPLE_USERS = [
  { name: 'João Silva', email: 'joao@example.com' },
  { name: 'Maria Santos', email: 'maria@example.com' },
  { name: 'Carlos Rodriguez', email: 'carlos@example.com' },
  { name: 'Ana García', email: 'ana@example.com' },
  { name: 'Michael Johnson', email: 'michael@example.com' }
];

function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

async function main() {
  console.log('🌱 Starting World Cup Pool seed...');

  // Create matches
  console.log('📅 Creating World Cup matches...');
  const matches = await Promise.all(
    WORLD_CUP_MATCHES.map(match =>
      prisma.match.create({
        data: {
          teamA: match.teamA,
          teamB: match.teamB,
          teamAFlag: match.teamAFlag,
          teamBFlag: match.teamBFlag,
          scheduledAt: new Date(match.date),
          matchType: match.type || 'group',
          groupName: match.group,
          venue: match.venue,
          status: 'scheduled'
        }
      })
    )
  );

  // Create sample users
  console.log('👥 Creating sample users...');
  const users = await Promise.all(
    SAMPLE_USERS.map(userData =>
      prisma.user.create({
        data: userData
      })
    )
  );

  // Create sample pools
  console.log('🏆 Creating sample pools...');
  const pools = await Promise.all([
    prisma.pool.create({
      data: {
        name: 'Amigos da Copa',
        description: 'Bolão dos amigos para a Copa do Mundo 2026',
        inviteCode: generateInviteCode(),
        ownerId: users[0].id,
        scoringRules: {
          exact_score: 3,
          correct_winner: 1,
          wrong: 0,
          bonus_final: 2 // Bonus points for final matches
        }
      }
    }),
    prisma.pool.create({
      data: {
        name: 'Escritório Tech',
        description: 'Bolão da galera da empresa',
        inviteCode: generateInviteCode(),
        ownerId: users[1].id,
        scoringRules: {
          exact_score: 5,
          correct_winner: 2,
          wrong: 0
        }
      }
    }),
    prisma.pool.create({
      data: {
        name: 'Família Mundial',
        description: 'Competição familiar da Copa',
        inviteCode: generateInviteCode(),
        ownerId: users[2].id
      }
    })
  ]);

  // Create pool memberships
  console.log('🎫 Adding users to pools...');
  await Promise.all([
    // Pool 1 memberships
    prisma.poolMembership.create({
      data: { poolId: pools[0].id, userId: users[0].id }
    }),
    prisma.poolMembership.create({
      data: { poolId: pools[0].id, userId: users[1].id }
    }),
    prisma.poolMembership.create({
      data: { poolId: pools[0].id, userId: users[2].id }
    }),
    // Pool 2 memberships
    prisma.poolMembership.create({
      data: { poolId: pools[1].id, userId: users[1].id }
    }),
    prisma.poolMembership.create({
      data: { poolId: pools[1].id, userId: users[3].id }
    }),
    prisma.poolMembership.create({
      data: { poolId: pools[1].id, userId: users[4].id }
    }),
    // Pool 3 memberships
    prisma.poolMembership.create({
      data: { poolId: pools[2].id, userId: users[2].id }
    }),
    prisma.poolMembership.create({
      data: { poolId: pools[2].id, userId: users[0].id }
    })
  ]);

  // Create sample picks for group stage matches
  console.log('⚽ Creating sample predictions...');
  const groupMatches = matches.filter(match => match.matchType === 'group').slice(0, 6);

  const picks = [];
  for (const match of groupMatches) {
    for (const pool of pools) {
      for (const user of users.slice(0, 3)) {
        // Only create pick if user is member of this pool
        const membership = await prisma.poolMembership.findUnique({
          where: { poolId_userId: { poolId: pool.id, userId: user.id } }
        });

        if (membership) {
          picks.push(prisma.pick.create({
            data: {
              userId: user.id,
              matchId: match.id,
              poolId: pool.id,
              predictedTeamAScore: Math.floor(Math.random() * 4),
              predictedTeamBScore: Math.floor(Math.random() * 4),
              aiSuggested: Math.random() > 0.7 // 30% chance of AI suggestion
            }
          }));
        }
      }
    }
  }

  await Promise.all(picks);

  // Create sample AI suggestions
  console.log('🤖 Creating AI suggestions...');
  const aiSuggestions = [];
  for (const match of groupMatches.slice(0, 3)) {
    for (const user of users.slice(0, 2)) {
      aiSuggestions.push(prisma.aISuggestion.create({
        data: {
          userId: user.id,
          matchId: match.id,
          suggestedTeamAScore: Math.floor(Math.random() * 3) + 1,
          suggestedTeamBScore: Math.floor(Math.random() * 3),
          confidence: Math.random() * 0.4 + 0.6, // 60-100% confidence
          reasoning: `Based on recent form and head-to-head record, ${match.teamA} has a slight advantage. Both teams have strong attacking capabilities, expecting goals from both sides.`
        }
      }));
    }
  }

  await Promise.all(aiSuggestions);

  console.log('✅ Seed completed successfully!');
  console.log(`📊 Created:
  - ${matches.length} World Cup matches
  - ${users.length} sample users
  - ${pools.length} sample pools
  - Pool memberships for all users
  - Sample predictions for group stage
  - AI suggestions for demonstration`);

  console.log('\n🎯 Pool invite codes:');
  pools.forEach(pool => {
    console.log(`  - ${pool.name}: ${pool.inviteCode}`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });