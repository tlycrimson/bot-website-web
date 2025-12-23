import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Section from "../components/hierarchy/Section";
import HierarchyTable from "../components/hierarchy/HierarchyTable";

export default function Hierarchy() {
  const { user } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black text-white px-6 py-16">
      <h1 className="text-5xl font-extrabold text-center tracking-widest mb-16">
        Royal Military Police — Command Hierarchy
      </h1>

      <div className="max-w-7xl mx-auto space-y-32 relative">

        {/* COMMANDING GENERALS */}
        <div className="flex justify-center relative">
          <Section title="Royal Military Police — Commanding Generals" accent="yellow" className="text-center">
            <HierarchyTable
              headers={["RMP Rank", "Username", "Army Rank"]}
              rows={[
                { rank: "Commander (Overseer)", username: "HGUHROC", armyRank: "Lieutenant General", robloxId: 1375596219 },
                { rank: "Provost Marshal", username: "DxthYousef", armyRank: "Major General", robloxId: 1642556111 },
              ]}
              theme="yellow"
              showAvatar
            />
          </Section>
          <div className="absolute bottom-[-60px] left-1/2 w-px h-16 bg-white/30" />
        </div>

        {/* DIVISIONAL COMMAND */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 relative">

          {/* SOR */}
          <div className="flex justify-center relative">
            <Section title="Special Operations Regiment" accent="orange" className="text-center">
              <HierarchyTable
                headers={["RMP", "Username", "Army Rank"]}
                rows={[
                  { rank: "Commander", username: "ArraySarterx", armyRank: "Brigadier", robloxId: 12052305 },
                  { rank: "Executive", username: "epichammer55", armyRank: "Colonel", robloxId: 1152043786 },
                ]}
                theme="orange"
                showAvatar
              />
            </Section>
            <div className="absolute top-[-60px] left-1/2 w-px h-16 bg-white/30" />
          </div>

          {/* PW */}
          <div className="flex justify-center relative">
            <Section title="Provost Wing" accent="red" className="text-center">
              <HierarchyTable
                headers={["RMP", "Username", "Army Rank"]}
                rows={[
                  { rank: "Executive", username: "Breadmanm10", armyRank: "Colonel", robloxId: 1083555833 },
                  { rank: "Executive", username: "DarthAnomaly", armyRank: "Colonel", robloxId: 1302919436 },
                ]}
                theme="red"
                showAvatar
              />
            </Section>
            <div className="absolute top-[-60px] left-1/2 w-px h-16 bg-white/30" />
          </div>

          <div className="absolute top-0 left-0 w-full h-px bg-white/30" style={{ top: "-30px" }} />
        </div>

        {/* SERGEANT MAJORS */}
        <div className="flex justify-center relative">
          <Section title="Sergeant Majors" accent="amber" className="text-center">
            <HierarchyTable
              headers={["RMP", "Username", "Army Rank"]}
              rows={[
                { rank: "Regimental Sergeant Major", username: "British_Colonies", armyRank: "RSM", robloxId: 55667788 },
                { rank: "Operations Sergeant Major", username: "Inzand", armyRank: "CSM", robloxId: 88776655 },
                { rank: "Provost Sergeant Major", username: "Spry568", armyRank: "CSM", robloxId: 33445566 },
              ]}
              theme="amber"
              showAvatar
            />
          </Section>

          <div className="absolute top-[-60px] left-[25%] w-px h-16 bg-white/30" />
          <div className="absolute top-[-60px] left-[75%] w-px h-16 bg-white/30" />
          <div className="absolute top-[-60px] left-[25%] w-[50%] h-px bg-white/30" />
        </div>

        {/* QUOTAS (No avatars) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-32">
          <Section title="High Rank Quota" accent="blue" className="text-center">
            <HierarchyTable
              headers={["Rank", "Requirements"]}
              rows={[
                ["Inspector", "3 Tryouts + 6 Phases"],
                ["Chief Inspector", "3 Tryouts + 2 Events"],
                ["Superintendent", "2 Tryouts + 6 Events"],
                ["Executive Officer", "Joint Event + Inspection"],
              ]}
              theme="blue"
            />
          </Section>

          <Section title="Low Rank Quota" accent="red" className="text-center">
            <HierarchyTable
              headers={["Rank", "Requirements"]}
              rows={[
                ["Constable", "105 minutes + 5 events"],
                ["Senior Constable", "95 minutes + 4 events"],
                ["Sergeant", "80 minutes + 2 events"],
                ["Staff Sergeant", "60 minutes + 2 events"],
              ]}
              theme="red"
            />
          </Section>
        </div>

      </div>
    </div>
  );
}
