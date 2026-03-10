import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// World Cup 2026 Sample Data - Realistic match schedule
const WORLD_CUP_MATCHES = [
  // Group Stage - Group A
  { teamA: 'Canadá', teamB: 'México', teamAFlag: 'ca', teamBFlag: 'mx', group: 'A', date: '2026-06-11T20:00:00Z', venue: 'BMO Field, Toronto' },
  { teamA: 'EUA', teamB: 'Marrocos', teamAFlag: 'us', teamBFlag: 'ma', group: 'A', date: '2026-06-12T17:00:00Z', venue: 'MetLife Stadium, New York' },
  { teamA: 'Canadá', teamB: 'Marrocos', teamAFlag: 'ca', teamBFlag: 'ma', group: 'A', date: '2026-06-16T14:00:00Z', venue: 'BC Place, Vancouver' },
  { teamA: 'EUA', teamB: 'México', teamAFlag: 'us', teamBFlag: 'mx', group: 'A', date: '2026-06-16T20:00:00Z', venue: 'SoFi Stadium, Los Angeles' },
  { teamA: 'México', teamB: 'Marrocos', teamAFlag: 'mx', teamBFlag: 'ma', group: 'A', date: '2026-06-20T14:00:00Z', venue: 'Arrowhead Stadium, Kansas City' },
  { teamA: 'EUA', teamB: 'Canadá', teamAFlag: 'us', teamBFlag: 'ca', group: 'A', date: '2026-06-20T20:00:00Z', venue: 'AT&T Stadium, Dallas' },

  // Group Stage - Group B
  { teamA: 'Brasil', teamB: 'Sérvia', teamAFlag: 'br', teamBFlag: 'rs', group: 'B', date: '2026-06-13T17:00:00Z', venue: 'Mercedes-Benz Stadium, Atlanta' },
  { teamA: 'Espanha', teamB: 'Japão', teamAFlag: 'es', teamBFlag: 'jp', group: 'B', date: '2026-06-13T20:00:00Z', venue: 'Hard Rock Stadium, Miami' },
  { teamA: 'Brasil', teamB: 'Japão', teamAFlag: 'br', teamBFlag: 'jp', group: 'B', date: '2026-06-17T17:00:00Z', venue: 'Gillette Stadium, Boston' },
  { teamA: 'Sérvia', teamB: 'Espanha', teamAFlag: 'rs', teamBFlag: 'es', group: 'B', date: '2026-06-17T20:00:00Z', venue: 'Lincoln Financial Field, Philadelphia' },
  { teamA: 'Japão', teamB: 'Sérvia', teamAFlag: 'jp', teamBFlag: 'rs', group: 'B', date: '2026-06-21T14:00:00Z', venue: 'Lumen Field, Seattle' },
  { teamA: 'Espanha', teamB: 'Brasil', teamAFlag: 'es', teamBFlag: 'br', group: 'B', date: '2026-06-21T20:00:00Z', venue: 'SoFi Stadium, Los Angeles' },

  // Group Stage - Group C
  { teamA: 'França', teamB: 'Dinamarca', teamAFlag: 'fr', teamBFlag: 'dk', group: 'C', date: '2026-06-14T14:00:00Z', venue: 'Arrowhead Stadium, Kansas City' },
  { teamA: 'Inglaterra', teamB: 'Coreia do Sul', teamAFlag: 'gb-eng', teamBFlag: 'kr', group: 'C', date: '2026-06-14T17:00:00Z', venue: 'Lumen Field, Seattle' },
  { teamA: 'França', teamB: 'Coreia do Sul', teamAFlag: 'fr', teamBFlag: 'kr', group: 'C', date: '2026-06-18T14:00:00Z', venue: 'Soldier Field, Chicago' },
  { teamA: 'Dinamarca', teamB: 'Inglaterra', teamAFlag: 'dk', teamBFlag: 'gb-eng', group: 'C', date: '2026-06-18T17:00:00Z', venue: 'AT&T Stadium, Dallas' },
  { teamA: 'Coreia do Sul', teamB: 'Dinamarca', teamAFlag: 'kr', teamBFlag: 'dk', group: 'C', date: '2026-06-22T14:00:00Z', venue: 'Hard Rock Stadium, Miami' },
  { teamA: 'Inglaterra', teamB: 'França', teamAFlag: 'gb-eng', teamBFlag: 'fr', group: 'C', date: '2026-06-22T20:00:00Z', venue: 'MetLife Stadium, New York' },

  // Group Stage - Group D
  { teamA: 'Argentina', teamB: 'Croácia', teamAFlag: 'ar', teamBFlag: 'hr', group: 'D', date: '2026-06-15T14:00:00Z', venue: 'Mercedes-Benz Stadium, Atlanta' },
  { teamA: 'Alemanha', teamB: 'Polônia', teamAFlag: 'de', teamBFlag: 'pl', group: 'D', date: '2026-06-15T17:00:00Z', venue: 'Gillette Stadium, Boston' },
  { teamA: 'Argentina', teamB: 'Polônia', teamAFlag: 'ar', teamBFlag: 'pl', group: 'D', date: '2026-06-19T14:00:00Z', venue: 'Hard Rock Stadium, Miami' },
  { teamA: 'Croácia', teamB: 'Alemanha', teamAFlag: 'hr', teamBFlag: 'de', group: 'D', date: '2026-06-19T17:00:00Z', venue: 'Soldier Field, Chicago' },
  { teamA: 'Polônia', teamB: 'Croácia', teamAFlag: 'pl', teamBFlag: 'hr', group: 'D', date: '2026-06-23T14:00:00Z', venue: 'AT&T Stadium, Dallas' },
  { teamA: 'Alemanha', teamB: 'Argentina', teamAFlag: 'de', teamBFlag: 'ar', group: 'D', date: '2026-06-23T20:00:00Z', venue: 'MetLife Stadium, New York' },

  // Group Stage - Group E
  { teamA: 'Portugal', teamB: 'Uruguai', teamAFlag: 'pt', teamBFlag: 'uy', group: 'E', date: '2026-06-12T14:00:00Z', venue: 'Arrowhead Stadium, Kansas City' },
  { teamA: 'Holanda', teamB: 'Suíça', teamAFlag: 'nl', teamBFlag: 'ch', group: 'E', date: '2026-06-12T20:00:00Z', venue: 'Lumen Field, Seattle' },
  { teamA: 'Portugal', teamB: 'Suíça', teamAFlag: 'pt', teamBFlag: 'ch', group: 'E', date: '2026-06-16T17:00:00Z', venue: 'Hard Rock Stadium, Miami' },
  { teamA: 'Uruguai', teamB: 'Holanda', teamAFlag: 'uy', teamBFlag: 'nl', group: 'E', date: '2026-06-16T20:00:00Z', venue: 'Mercedes-Benz Stadium, Atlanta' },
  { teamA: 'Suíça', teamB: 'Uruguai', teamAFlag: 'ch', teamBFlag: 'uy', group: 'E', date: '2026-06-20T17:00:00Z', venue: 'Gillette Stadium, Boston' },
  { teamA: 'Holanda', teamB: 'Portugal', teamAFlag: 'nl', teamBFlag: 'pt', group: 'E', date: '2026-06-20T20:00:00Z', venue: 'SoFi Stadium, Los Angeles' },

  // Group Stage - Group F
  { teamA: 'Bélgica', teamB: 'Colômbia', teamAFlag: 'be', teamBFlag: 'co', group: 'F', date: '2026-06-13T14:00:00Z', venue: 'AT&T Stadium, Dallas' },
  { teamA: 'Itália', teamB: 'Equador', teamAFlag: 'it', teamBFlag: 'ec', group: 'F', date: '2026-06-13T17:00:00Z', venue: 'Soldier Field, Chicago' },
  { teamA: 'Bélgica', teamB: 'Equador', teamAFlag: 'be', teamBFlag: 'ec', group: 'F', date: '2026-06-17T14:00:00Z', venue: 'Arrowhead Stadium, Kansas City' },
  { teamA: 'Colômbia', teamB: 'Itália', teamAFlag: 'co', teamBFlag: 'it', group: 'F', date: '2026-06-17T17:00:00Z', venue: 'Lumen Field, Seattle' },
  { teamA: 'Equador', teamB: 'Colômbia', teamAFlag: 'ec', teamBFlag: 'co', group: 'F', date: '2026-06-21T17:00:00Z', venue: 'MetLife Stadium, New York' },
  { teamA: 'Itália', teamB: 'Bélgica', teamAFlag: 'it', teamBFlag: 'be', group: 'F', date: '2026-06-21T20:00:00Z', venue: 'Hard Rock Stadium, Miami' },

  // Group Stage - Group G
  { teamA: 'Senegal', teamB: 'Austrália', teamAFlag: 'sn', teamBFlag: 'au', group: 'G', date: '2026-06-14T20:00:00Z', venue: 'Mercedes-Benz Stadium, Atlanta' },
  { teamA: 'Suécia', teamB: 'Nigéria', teamAFlag: 'se', teamBFlag: 'ng', group: 'G', date: '2026-06-15T14:00:00Z', venue: 'Gillette Stadium, Boston' },
  { teamA: 'Senegal', teamB: 'Nigéria', teamAFlag: 'sn', teamBFlag: 'ng', group: 'G', date: '2026-06-18T20:00:00Z', venue: 'AT&T Stadium, Dallas' },
  { teamA: 'Austrália', teamB: 'Suécia', teamAFlag: 'au', teamBFlag: 'se', group: 'G', date: '2026-06-19T14:00:00Z', venue: 'Arrowhead Stadium, Kansas City' },
  { teamA: 'Nigéria', teamB: 'Austrália', teamAFlag: 'ng', teamBFlag: 'au', group: 'G', date: '2026-06-22T17:00:00Z', venue: 'Lumen Field, Seattle' },
  { teamA: 'Suécia', teamB: 'Senegal', teamAFlag: 'se', teamBFlag: 'sn', group: 'G', date: '2026-06-22T20:00:00Z', venue: 'SoFi Stadium, Los Angeles' },

  // Group Stage - Group H
  { teamA: 'Irã', teamB: 'Costa Rica', teamAFlag: 'ir', teamBFlag: 'cr', group: 'H', date: '2026-06-15T17:00:00Z', venue: 'Hard Rock Stadium, Miami' },
  { teamA: 'País de Gales', teamB: 'Egito', teamAFlag: 'gb-wls', teamBFlag: 'eg', group: 'H', date: '2026-06-15T20:00:00Z', venue: 'Soldier Field, Chicago' },
  { teamA: 'Irã', teamB: 'Egito', teamAFlag: 'ir', teamBFlag: 'eg', group: 'H', date: '2026-06-19T17:00:00Z', venue: 'MetLife Stadium, New York' },
  { teamA: 'Costa Rica', teamB: 'País de Gales', teamAFlag: 'cr', teamBFlag: 'gb-wls', group: 'H', date: '2026-06-19T20:00:00Z', venue: 'Gillette Stadium, Boston' },
  { teamA: 'Egito', teamB: 'Costa Rica', teamAFlag: 'eg', teamBFlag: 'cr', group: 'H', date: '2026-06-23T17:00:00Z', venue: 'Mercedes-Benz Stadium, Atlanta' },
  { teamA: 'País de Gales', teamB: 'Irã', teamAFlag: 'gb-wls', teamBFlag: 'ir', group: 'H', date: '2026-06-23T20:00:00Z', venue: 'Hard Rock Stadium, Miami' },

  // Round of 16
  { teamA: 'TBD', teamB: 'TBD', teamAFlag: null, teamBFlag: null, group: null, date: '2026-06-27T17:00:00Z', venue: 'MetLife Stadium, New York', type: 'round_16' },
  { teamA: 'TBD', teamB: 'TBD', teamAFlag: null, teamBFlag: null, group: null, date: '2026-06-27T20:00:00Z', venue: 'SoFi Stadium, Los Angeles', type: 'round_16' },
  { teamA: 'TBD', teamB: 'TBD', teamAFlag: null, teamBFlag: null, group: null, date: '2026-06-28T17:00:00Z', venue: 'AT&T Stadium, Dallas', type: 'round_16' },
  { teamA: 'TBD', teamB: 'TBD', teamAFlag: null, teamBFlag: null, group: null, date: '2026-06-28T20:00:00Z', venue: 'Mercedes-Benz Stadium, Atlanta', type: 'round_16' },
  { teamA: 'TBD', teamB: 'TBD', teamAFlag: null, teamBFlag: null, group: null, date: '2026-06-29T17:00:00Z', venue: 'Hard Rock Stadium, Miami', type: 'round_16' },
  { teamA: 'TBD', teamB: 'TBD', teamAFlag: null, teamBFlag: null, group: null, date: '2026-06-29T20:00:00Z', venue: 'Gillette Stadium, Boston', type: 'round_16' },
  { teamA: 'TBD', teamB: 'TBD', teamAFlag: null, teamBFlag: null, group: null, date: '2026-06-30T17:00:00Z', venue: 'Arrowhead Stadium, Kansas City', type: 'round_16' },
  { teamA: 'TBD', teamB: 'TBD', teamAFlag: null, teamBFlag: null, group: null, date: '2026-06-30T20:00:00Z', venue: 'Lumen Field, Seattle', type: 'round_16' },

  // Quarter Finals
  { teamA: 'TBD', teamB: 'TBD', teamAFlag: null, teamBFlag: null, group: null, date: '2026-07-04T17:00:00Z', venue: 'Mercedes-Benz Stadium, Atlanta', type: 'quarter' },
  { teamA: 'TBD', teamB: 'TBD', teamAFlag: null, teamBFlag: null, group: null, date: '2026-07-04T20:00:00Z', venue: 'Hard Rock Stadium, Miami', type: 'quarter' },
  { teamA: 'TBD', teamB: 'TBD', teamAFlag: null, teamBFlag: null, group: null, date: '2026-07-05T17:00:00Z', venue: 'SoFi Stadium, Los Angeles', type: 'quarter' },
  { teamA: 'TBD', teamB: 'TBD', teamAFlag: null, teamBFlag: null, group: null, date: '2026-07-05T20:00:00Z', venue: 'AT&T Stadium, Dallas', type: 'quarter' },

  // Semi Finals
  { teamA: 'TBD', teamB: 'TBD', teamAFlag: null, teamBFlag: null, group: null, date: '2026-07-08T20:00:00Z', venue: 'AT&T Stadium, Dallas', type: 'semi' },
  { teamA: 'TBD', teamB: 'TBD', teamAFlag: null, teamBFlag: null, group: null, date: '2026-07-09T20:00:00Z', venue: 'Mercedes-Benz Stadium, Atlanta', type: 'semi' },

  // Third Place
  { teamA: 'TBD', teamB: 'TBD', teamAFlag: null, teamBFlag: null, group: null, date: '2026-07-12T15:00:00Z', venue: 'Hard Rock Stadium, Miami', type: 'third_place' },

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

  // Clean existing data (in correct order due to foreign keys)
  console.log('🧹 Cleaning existing data...');
  await prisma.calendarEvent.deleteMany({});
  await prisma.aISuggestion.deleteMany({});
  await prisma.pick.deleteMany({});
  await prisma.poolMembership.deleteMany({});
  await prisma.pool.deleteMany({});
  await prisma.match.deleteMany({});
  await prisma.user.deleteMany({});
  console.log('✅ Database cleaned successfully');

  // Create matches
  console.log('📅 Creating World Cup matches...');
  const matches = await Promise.all(
    WORLD_CUP_MATCHES.map((match, index) =>
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
          // First match (Canadá vs México) is finished for demonstration
          status: index === 0 ? 'finished' : 'scheduled',
          teamAScore: index === 0 ? 2 : null,
          teamBScore: index === 0 ? 1 : null
        }
      })
    )
  );
  
  console.log('🎯 First match (Canadá 2 x 1 México) set as finished for demonstration');

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
        name: 'Copa Tech',
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
        name: 'Hexa 2026',
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
  
  // Calculate points for the finished match (first match)
  console.log('🏆 Calculating points for finished match...');
  const finishedMatch = matches[0];
  const finishedMatchPicks = await prisma.pick.findMany({
    where: { matchId: finishedMatch.id },
    include: { pool: true }
  });
  
  for (const pick of finishedMatchPicks) {
    const predictedWinner = pick.predictedTeamAScore > pick.predictedTeamBScore ? 'A' :
                           pick.predictedTeamAScore < pick.predictedTeamBScore ? 'B' : 'draw';
    const actualWinner = finishedMatch.teamAScore! > finishedMatch.teamBScore! ? 'A' :
                        finishedMatch.teamAScore! < finishedMatch.teamBScore! ? 'B' : 'draw';
    
    let points = 0;
    const scoringRules = pick.pool.scoringRules as any;
    
    // Exact score
    if (pick.predictedTeamAScore === finishedMatch.teamAScore &&
        pick.predictedTeamBScore === finishedMatch.teamBScore) {
      points = scoringRules.exact_score || 3;
    }
    // Correct winner
    else if (predictedWinner === actualWinner && predictedWinner !== 'draw') {
      points = scoringRules.correct_winner || 1;
    }
    // Wrong prediction
    else {
      points = scoringRules.wrong || 0;
    }
    
    await prisma.pick.update({
      where: { id: pick.id },
      data: { points }
    });
  }
  
  console.log(`✅ Points calculated for ${finishedMatchPicks.length} picks`);

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
  - ${matches.length} World Cup matches (1 finished for demo)
  - ${users.length} sample users
  - ${pools.length} sample pools
  - Pool memberships for all users
  - Sample predictions for group stage
  - Points calculated for finished match
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