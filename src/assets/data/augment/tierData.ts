import { AugmentTier } from '@interfaces/study/remix/AugmentTier'

export const baseTierWeights: Record<AugmentTier, number> = {
  silver: 61.0,
  gold: 35.0,
  emerald: 3.9,
  titanium: 0.1,
}

export const tierWeightAdjustmentsStage2: Record<
  AugmentTier,
  Record<AugmentTier, number>
> = {
  silver: {
    silver: 35.7,
    gold: 60.6,
    emerald: 3.6,
    titanium: 0.1,
  },
  gold: {
    silver: 32.2,
    gold: 40.1,
    emerald: 27.4,
    titanium: 0.3,
  },
  emerald: {
    silver: 49.8,
    gold: 29.9,
    emerald: 20.0,
    titanium: 0.3,
  },
  titanium: {
    silver: 55.0,
    gold: 40.0,
    emerald: 5.0,
    titanium: 0.0,
  },
}

export const tierWeightAdjustmentsStage3: Record<
  AugmentTier,
  Record<AugmentTier, Record<AugmentTier, number>>
> = {
  silver: {
    silver: {
      silver: 3.0,
      gold: 46.8,
      emerald: 49.9,
      titanium: 0.3,
    },
    gold: {
      silver: 0.8,
      gold: 69.0,
      emerald: 30.0,
      titanium: 0.2,
    },
    emerald: {
      silver: 0.2,
      gold: 2.0,
      emerald: 97.7,
      titanium: 0.1,
    },
    titanium: {
      silver: 60.0,
      gold: 37.0,
      emerald: 3.0,
      titanium: 0.0,
    },
  },

  gold: {
    silver: {
      silver: 0.8,
      gold: 94.1,
      emerald: 4.9,
      titanium: 0.2,
    },
    gold: {
      silver: 0.5,
      gold: 87.4,
      emerald: 11.9,
      titanium: 0.2,
    },
    emerald: {
      silver: 34.9,
      gold: 58.9,
      emerald: 5.9,
      titanium: 0.3,
    },
    titanium: {
      silver: 60.0,
      gold: 37.0,
      emerald: 3.0,
      titanium: 0.0,
    },
  },

  emerald: {
    silver: {
      silver: 0.7,
      gold: 79.2,
      emerald: 19.9,
      titanium: 0.2,
    },
    gold: {
      silver: 0.4,
      gold: 66.1,
      emerald: 33.3,
      titanium: 0.2,
    },
    emerald: {
      silver: 0.3,
      gold: 49.6,
      emerald: 49.9,
      titanium: 0.2,
    },
    titanium: {
      silver: 60.0,
      gold: 37.0,
      emerald: 3.0,
      titanium: 0.0,
    },
  },

  titanium: {
    silver: {
      silver: 60.0,
      gold: 37.0,
      emerald: 3.0,
      titanium: 0.0,
    },
    gold: {
      silver: 60.0,
      gold: 37.0,
      emerald: 3.0,
      titanium: 0.0,
    },
    emerald: {
      silver: 60.0,
      gold: 37.0,
      emerald: 3.0,
      titanium: 0.0,
    },
    titanium: {
      silver: 60.0,
      gold: 37.0,
      emerald: 3.0,
      titanium: 0.0,
    },
  },
}

export const tierWeightAdjustmentsStage4: Record<
  AugmentTier,
  Record<AugmentTier, Record<AugmentTier, Record<AugmentTier, number>>>
> = {
  silver: {
    silver: {
      silver: { silver: 20.0, gold: 60.0, emerald: 19.9, titanium: 0.1 },
      gold: { silver: 10.0, gold: 70.0, emerald: 19.9, titanium: 0.1 },
      emerald: { silver: 0.0, gold: 55.0, emerald: 44.9, titanium: 0.1 },
      titanium: { silver: 65.0, gold: 33.0, emerald: 2.0, titanium: 0.0 },
    },
    gold: {
      silver: { silver: 20.0, gold: 60.0, emerald: 19.9, titanium: 0.1 },
      gold: { silver: 10.0, gold: 70.0, emerald: 19.9, titanium: 0.1 },
      emerald: { silver: 0.0, gold: 55.0, emerald: 44.9, titanium: 0.1 },
      titanium: { silver: 65.0, gold: 33.0, emerald: 2.0, titanium: 0.0 },
    },
    emerald: {
      silver: { silver: 20.0, gold: 60.0, emerald: 19.9, titanium: 0.1 },
      gold: { silver: 10.0, gold: 70.0, emerald: 19.9, titanium: 0.1 },
      emerald: { silver: 0.0, gold: 55.0, emerald: 44.9, titanium: 0.1 },
      titanium: { silver: 65.0, gold: 33.0, emerald: 2.0, titanium: 0.0 },
    },
    titanium: {
      silver: { silver: 65.0, gold: 33.0, emerald: 2.0, titanium: 0.0 },
      gold: { silver: 65.0, gold: 33.0, emerald: 2.0, titanium: 0.0 },
      emerald: { silver: 65.0, gold: 33.0, emerald: 2.0, titanium: 0.0 },
      titanium: { silver: 65.0, gold: 33.0, emerald: 2.0, titanium: 0.0 },
    },
  },

  gold: {
    silver: {
      silver: { silver: 20.0, gold: 60.0, emerald: 19.9, titanium: 0.1 },
      gold: { silver: 10.0, gold: 70.0, emerald: 19.9, titanium: 0.1 },
      emerald: { silver: 0.0, gold: 55.0, emerald: 44.9, titanium: 0.1 },
      titanium: { silver: 65.0, gold: 33.0, emerald: 2.0, titanium: 0.0 },
    },
    gold: {
      silver: { silver: 20.0, gold: 60.0, emerald: 19.9, titanium: 0.1 },
      gold: { silver: 10.0, gold: 70.0, emerald: 19.9, titanium: 0.1 },
      emerald: { silver: 0.0, gold: 55.0, emerald: 44.9, titanium: 0.1 },
      titanium: { silver: 65.0, gold: 33.0, emerald: 2.0, titanium: 0.0 },
    },
    emerald: {
      silver: { silver: 20.0, gold: 60.0, emerald: 19.9, titanium: 0.1 },
      gold: { silver: 10.0, gold: 70.0, emerald: 19.9, titanium: 0.1 },
      emerald: { silver: 0.0, gold: 55.0, emerald: 44.9, titanium: 0.1 },
      titanium: { silver: 65.0, gold: 33.0, emerald: 2.0, titanium: 0.0 },
    },
    titanium: {
      silver: { silver: 65.0, gold: 33.0, emerald: 2.0, titanium: 0.0 },
      gold: { silver: 65.0, gold: 33.0, emerald: 2.0, titanium: 0.0 },
      emerald: { silver: 65.0, gold: 33.0, emerald: 2.0, titanium: 0.0 },
      titanium: { silver: 65.0, gold: 33.0, emerald: 2.0, titanium: 0.0 },
    },
  },

  emerald: {
    silver: {
      silver: { silver: 20.0, gold: 60.0, emerald: 19.9, titanium: 0.1 },
      gold: { silver: 10.0, gold: 70.0, emerald: 19.9, titanium: 0.1 },
      emerald: { silver: 0.0, gold: 55.0, emerald: 44.9, titanium: 0.1 },
      titanium: { silver: 65.0, gold: 33.0, emerald: 2.0, titanium: 0.0 },
    },
    gold: {
      silver: { silver: 20.0, gold: 60.0, emerald: 19.9, titanium: 0.1 },
      gold: { silver: 10.0, gold: 70.0, emerald: 19.9, titanium: 0.1 },
      emerald: { silver: 0.0, gold: 55.0, emerald: 44.9, titanium: 0.1 },
      titanium: { silver: 65.0, gold: 33.0, emerald: 2.0, titanium: 0.0 },
    },
    emerald: {
      silver: { silver: 20.0, gold: 60.0, emerald: 19.9, titanium: 0.1 },
      gold: { silver: 10.0, gold: 70.0, emerald: 19.9, titanium: 0.1 },
      emerald: { silver: 0.0, gold: 55.0, emerald: 44.9, titanium: 0.1 },
      titanium: { silver: 65.0, gold: 33.0, emerald: 2.0, titanium: 0.0 },
    },
    titanium: {
      silver: { silver: 65.0, gold: 33.0, emerald: 2.0, titanium: 0.0 },
      gold: { silver: 65.0, gold: 33.0, emerald: 2.0, titanium: 0.0 },
      emerald: { silver: 65.0, gold: 33.0, emerald: 2.0, titanium: 0.0 },
      titanium: { silver: 65.0, gold: 33.0, emerald: 2.0, titanium: 0.0 },
    },
  },

  titanium: {
    silver: {
      silver: { silver: 65.0, gold: 33.0, emerald: 2.0, titanium: 0.0 },
      gold: { silver: 65.0, gold: 33.0, emerald: 2.0, titanium: 0.0 },
      emerald: { silver: 65.0, gold: 33.0, emerald: 2.0, titanium: 0.0 },
      titanium: { silver: 65.0, gold: 33.0, emerald: 2.0, titanium: 0.0 },
    },
    gold: {
      silver: { silver: 65.0, gold: 33.0, emerald: 2.0, titanium: 0.0 },
      gold: { silver: 65.0, gold: 33.0, emerald: 2.0, titanium: 0.0 },
      emerald: { silver: 65.0, gold: 33.0, emerald: 2.0, titanium: 0.0 },
      titanium: { silver: 65.0, gold: 33.0, emerald: 2.0, titanium: 0.0 },
    },
    emerald: {
      silver: { silver: 65.0, gold: 33.0, emerald: 2.0, titanium: 0.0 },
      gold: { silver: 65.0, gold: 33.0, emerald: 2.0, titanium: 0.0 },
      emerald: { silver: 65.0, gold: 33.0, emerald: 2.0, titanium: 0.0 },
      titanium: { silver: 65.0, gold: 33.0, emerald: 2.0, titanium: 0.0 },
    },
    titanium: {
      silver: { silver: 65.0, gold: 33.0, emerald: 2.0, titanium: 0.0 },
      gold: { silver: 65.0, gold: 33.0, emerald: 2.0, titanium: 0.0 },
      emerald: { silver: 65.0, gold: 33.0, emerald: 2.0, titanium: 0.0 },
      titanium: { silver: 65.0, gold: 33.0, emerald: 2.0, titanium: 0.0 },
    },
  },
}
