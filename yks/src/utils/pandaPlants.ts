import {isValidDayKey} from './date';
export type PlantRoom='garden'|'balcony';
export interface PandaPlant {growth:number;wateredDay:string}
export type PandaPlants=Record<PlantRoom,PandaPlant>;
export function sanitizePandaPlants(raw:unknown):PandaPlants{
 const source=raw&&typeof raw==='object'?raw as Record<string,unknown>:{};
 const plant=(room:PlantRoom):PandaPlant=>{const p=source[room]&&typeof source[room]==='object'?source[room] as Record<string,unknown>:{};return {growth:typeof p.growth==='number'&&Number.isFinite(p.growth)?Math.max(0,Math.min(3,Math.floor(p.growth))):0,wateredDay:typeof p.wateredDay==='string'&&isValidDayKey(p.wateredDay)?p.wateredDay:''};};
 return {garden:plant('garden'),balcony:plant('balcony')};
}
/** One watering per local calendar day. A full-grown flower still needs daily care. */
export function waterPandaPlant(raw:unknown,room:PlantRoom,day:string):PandaPlants{
 const plants=sanitizePandaPlants(raw);
 if(!isValidDayKey(day)||plants[room].wateredDay>=day)return plants;
 return {...plants,[room]:{growth:Math.min(3,plants[room].growth+1),wateredDay:day}};
}
