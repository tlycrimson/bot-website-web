
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Section from "../components/hierarchy/Section";
import HierarchyTable from "../components/hierarchy/HierarchyTable";



export default function Hierarchy() {

  const { user } = useContext(AuthContext);
  const isHiCom = user?.isHiCom;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black text-white px-6 py-16">

      <h1 className="text-5xl font-extrabold text-center tracking-widest mb-16">
        Command Hierarchy
      </h1>

      <div className="max-w-7xl mx-auto space-y-16">

        {/* COMMANDING GENERALS */}
        <Section title="Royal Military Police — Commanding Generals" accent="yellow">
          <HierarchyTable
            headers={["RMP Rank", "Username", "Army Rank"]}
            rows={[
              ["Commander (Overseer)", "HGUHROC", "Lieutenant General"],
              ["Provost Marshal", "DxthYousef", "Major General"],
            ]}
            theme="yellow"
          />
        </Section>

        {/* DIVISIONAL COMMAND */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          <Section title="Special Operations Regiment" accent="orange">
            <HierarchyTable
              headers={["RMP", "Username", "Army Rank"]}
              rows={[
                ["Commander", "ArraySarterx", "Brigadier"],
                ["Executive", "epichammer55", "Colonel"],
              ]}
              theme="orange"
            />
          </Section>

          <Section title="Provost Wing" accent="red">
            <HierarchyTable
              headers={["RMP", "Username", "Army Rank"]}
              rows={[
                ["Commander", "Breadman10", "Brigadier"],
                ["Executive", "DarthAnomaly", "Colonel"],
              ]}
              theme="red"
            />
          </Section>

        </div>

        {/* SERGEANT MAJORS */}
        <Section title="Sergeant Majors" accent="amber">
          <HierarchyTable
            headers={["RMP", "Username", "Army Rank"]}
            rows={[
              ["Regimental Sergeant Major", "British_Colonies", "RSM"],
              ["Operations Sergeant Major", "Inzand", "CSM"],
              ["Provost Sergeant Major", "Spry568", "CSM"],
            ]}
            theme="amber"
          />
        </Section>

        {/* QUOTAS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          <Section title="High Rank Quota" accent="blue">
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

          <Section title="Low Rank Quota" accent="red">
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
