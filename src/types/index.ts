export interface PlanetTelemetry {
  designation: string;
  classification: string;
  diameterKm: number;
  surfaceGravityG: number;
  surfaceTempC: number;
  rotationPeriodHours: number;
  orbitalVelocityKmS: number;
  atmosphereComposition: string;
}

export type ModalType = 'none' | 'how-it-works';

export type AppScreen = 'home' | 'lab-select' | 'gravity-lab';
