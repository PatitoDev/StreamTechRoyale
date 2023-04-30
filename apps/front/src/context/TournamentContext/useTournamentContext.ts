import { useContext } from "react"
import { TournamentContext } from ".";

export const useTournamentContext = () => {
    const ctx = useContext(TournamentContext);
    if (!ctx) throw new Error('Tournamne context missing');
    return ctx;
}