import React, { createContext, useContext, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { Comment } from '@/interactive/interactive-data';

interface VoteData {
  [teamId: string]: number;
}

interface PlayerRating {
  [playerId: string]: { total: number; count: number };
}

interface CheerHeat {
  [sloganId: string]: number;
}

interface InteractionState {
  votes: VoteData;
  hasVoted: boolean;
  playerRatings: PlayerRating;
  ratedPlayers: string[];
  comments: Comment[];
  cheerHeat: CheerHeat;
}

interface InteractionContextType extends InteractionState {
  voteForTeam: (teamId: string) => void;
  ratePlayer: (playerId: string, rating: number) => void;
  addComment: (comment: Omit<Comment, 'id' | 'timestamp'>) => void;
  cheerSlogan: (sloganId: string) => void;
  getPlayerAvgRating: (playerId: string, baseRating: number) => number;
}

const InteractionContext = createContext<InteractionContextType | null>(null);

export function InteractionProvider({ children }: { children: React.ReactNode }) {
  const [votes, setVotes] = useLocalStorage<VoteData>('xiangchao-votes', {});
  const [hasVoted, setHasVoted] = useLocalStorage<boolean>('xiangchao-has-voted', false);
  const [playerRatings, setPlayerRatings] = useLocalStorage<PlayerRating>('xiangchao-ratings', {});
  const [ratedPlayers, setRatedPlayers] = useLocalStorage<string[]>('xiangchao-rated', []);
  const [comments, setComments] = useLocalStorage<Comment[]>('xiangchao-comments', []);
  const [cheerHeat, setCheerHeat] = useLocalStorage<CheerHeat>('xiangchao-cheer', {});

  const voteForTeam = useCallback((teamId: string) => {
    if (hasVoted) return;
    setVotes(prev => ({
      ...prev,
      [teamId]: (prev[teamId] || 0) + 1,
    }));
    setHasVoted(true);
  }, [hasVoted, setVotes, setHasVoted]);

  const ratePlayer = useCallback((playerId: string, rating: number) => {
    if (ratedPlayers.includes(playerId)) return;
    setPlayerRatings(prev => {
      const existing = prev[playerId] || { total: 0, count: 0 };
      return {
        ...prev,
        [playerId]: {
          total: existing.total + rating,
          count: existing.count + 1,
        },
      };
    });
    setRatedPlayers(prev => [...prev, playerId]);
  }, [ratedPlayers, setPlayerRatings, setRatedPlayers]);

  const addComment = useCallback((comment: Omit<Comment, 'id' | 'timestamp'>) => {
    const newComment: Comment = {
      ...comment,
      id: `comment-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: Date.now(),
    };
    setComments(prev => [newComment, ...prev].slice(0, 100));
  }, [setComments]);

  const cheerSlogan = useCallback((sloganId: string) => {
    setCheerHeat(prev => ({
      ...prev,
      [sloganId]: (prev[sloganId] || 0) + 1,
    }));
  }, [setCheerHeat]);

  const getPlayerAvgRating = useCallback((playerId: string, baseRating: number) => {
    const rating = playerRatings[playerId];
    if (!rating || rating.count === 0) return baseRating;
    const userAvg = rating.total / rating.count;
    return +((baseRating * 0.6 + userAvg * 0.4).toFixed(1));
  }, [playerRatings]);

  return (
    <InteractionContext.Provider
      value={{
        votes,
        hasVoted,
        playerRatings,
        ratedPlayers,
        comments,
        cheerHeat,
        voteForTeam,
        ratePlayer,
        addComment,
        cheerSlogan,
        getPlayerAvgRating,
      }}
    >
      {children}
    </InteractionContext.Provider>
  );
}

export function useInteraction() {
  const context = useContext(InteractionContext);
  if (!context) {
    throw new Error('useInteraction must be used within InteractionProvider');
  }
  return context;
}
