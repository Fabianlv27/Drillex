
import { GetLocalHost } from "../../../api/api.js";
const { host } = GetLocalHost();

export async function WordsMatcher(idList, LyricReal,GetWords) {


    const Words = await GetWords(idList);

 const SentData = {
        Liryc: LyricReal.map((e) => e.replace(/\r/g, "")),
        Words: Words,
      };
      const data = await fetch(`${host}/getMatches`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(SentData),
      });
      const Matches = await data.json();
      console.log(Matches);
      const AdptedMatches = { Matches, mode: 1 };
      console.log(AdptedMatches);
      return AdptedMatches;

}
export const PhrMatcher =async (LyricReal) => {
      const data = await fetch(`${host}/PhrMatches`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(LyricReal),
      });
      const Matches = await data.json();
      console.log(Matches);
      return Matches;
}