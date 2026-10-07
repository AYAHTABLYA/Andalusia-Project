import { memo } from "react";
import { Link } from "react-router-dom";
import type { CareerPath } from "../../../Types/CareerPath";
import type { ApiState } from "../../../Types/ApiState";
import { API_STATES, DOMAIN_OPTIONS, PROGRESSION_LEVELS } from "./constants";
import Breadcrumb from "../Shared/Breadcrumb";
import "./style.css";

type Props = {
  paths: CareerPath[];
  apiState: ApiState;
  searchQuery: string;
  selectedDomain: string;
  onApiStateChange: (state: ApiState) => void;
  onSearchChange: (value: string) => void;
  onDomainChange: (value: string) => void;
  onReset: () => void;
};

const STATS: { label: string; key: "duration" | "credits" | "diplomas" | "courses"; accent?: boolean }[] = [
  { label: "Duration", key: "duration" },
  { label: "Credits", key: "credits", accent: true },
  { label: "Programs", key: "diplomas" },
  { label: "Modules", key: "courses" },
];

function CareerPathsComponent({
  paths, apiState, searchQuery, selectedDomain,
  onApiStateChange, onSearchChange, onDomainChange, onReset,
}: Props) {
  return (
    <div className="career-paths_box-1">
      <section className="career-paths_section-1">
        <div className="career-paths_box-2">
          <div className="career-paths_box-3">
            <span className="career-paths_text-1"></span>
            <span className="career-paths_text-2">Alexandria Executive Engine</span>
            <span>|</span>
            <code className="career-paths_code-1">/api/career-paths</code>
          </div>
          <div className="career-paths_box-4">
            <span className="career-paths_text-3">Simulator:</span>
            {API_STATES.map((st) => (
              <button
                key={st}
                onClick={() => onApiStateChange(st)}
                className={`career-paths_btn-1 ${apiState === st ? "career-paths_btn-1--on" : "career-paths_btn-1--off"}`.trim()}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="career-paths_box-5">
        <Breadcrumb items={[{ label: "Academic Home", to: "/" }, { label: "Executive Career Paths" }]} />

        <div className="career-paths_box-6">
          <span className="career-paths_text-5">
            <span className="career-paths_text-6"></span>
            Multi-Tier Executive Pathways • Alexandria Campus &amp; Hybrid
          </span>
          <h1 className="career-paths_title-1">Executive Career Paths &amp; Leadership Roadmaps</h1>
          <p className="career-paths_text-7">
            Comprehensive multi-tier executive trajectories bridging specialized professional courses, accredited postgraduate diplomas, and boardroom defense in Alexandria.
          </p>
        </div>

        <div className="career-paths_box-7">
          <h2 className="career-paths_title-2">
            <span className="career-paths_text-8 material-symbols-outlined">schema</span>
            The Academic Progression Framework: From Units to Fellowship
          </h2>
          <div className="career-paths_box-8">
            {PROGRESSION_LEVELS.map((l) => (
              <div
                key={l.level}
                className={`career-paths_box-9 ${l.highlighted ? "career-paths_box-9--on" : "career-paths_box-9--off"}`.trim()}
              >
                <div className="career-paths_box-10">{l.level}</div>
                <div className="career-paths_box-11">{l.title}</div>
                <p className="career-paths_text-9">{l.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="career-paths_box-12">
          <div className="career-paths_box-13">
            <span className="career-paths_text-10 material-symbols-outlined">search</span>
            <input
              type="text"
              placeholder="Search executive roles or skills..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="career-paths_input-1"
            />
          </div>
          <div className="career-paths_box-14">
            <label className="career-paths_label-1">Domain:</label>
            <select
              value={selectedDomain}
              onChange={(e) => onDomainChange(e.target.value)}
              className="career-paths_select-1"
            >
              {DOMAIN_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <button onClick={onReset} className="career-paths_btn-2">Reset</button>
          </div>
        </div>

        {apiState === "skeleton" ? (
          <div className="career-paths_box-15">
            <div className="career-paths_box-16"></div>
            <div className="career-paths_box-16"></div>
          </div>
        ) : apiState === "empty" || paths.length === 0 ? (
          <div className="career-paths_box-17">
            <span className="career-paths_text-11 material-symbols-outlined">filter_alt_off</span>
            <h3 className="career-paths_title-3">No Career Paths Found</h3>
            <p className="career-paths_text-12">Try resetting filters to show verified pathways.</p>
            <button onClick={() => { onReset(); onApiStateChange("catalog"); }} className="career-paths_btn-3">
              Clear Filters
            </button>
          </div>
        ) : apiState === "error" ? (
          <div className="career-paths_box-18">
            <span className="career-paths_text-13 material-symbols-outlined">cloud_off</span>
            <h3 className="career-paths_title-3">Alexandria Registry Gateway Error (500)</h3>
            <p className="career-paths_text-12">Unable to sync with institutional database. Try refreshing connection.</p>
            <button onClick={() => onApiStateChange("catalog")} className="career-paths_btn-3">
              Retry Connection
            </button>
          </div>
        ) : (
          <div className="career-paths_box-1">
            {paths.map((item) => (
              <article key={item.id} className="career-paths_card-1">
                <div className="career-paths_box-19">
                  <div className="career-paths_box-20">
                    <div className="career-paths_box-21">
                      <span className="career-paths_text-14">{item.domain}</span>
                      <span className="career-paths_text-15">{item.status}</span>
                      <span className="career-paths_text-16">ID: {item.id}</span>
                    </div>
                    <h3 className="career-paths_title-4">
                      <Link to={item.pathUrl} className="career-paths_link-2">{item.title}</Link>
                    </h3>
                    <p className="career-paths_text-12"><strong className="career-paths_strong-1">Target Roles:</strong> {item.roles}</p>
                    <p className="career-paths_text-17">{item.summary}</p>
                    <div className="career-paths_box-22">
                      {STATS.map((s) => (
                        <div key={s.key} className="career-paths_box-23">
                          <span className="career-paths_text-18">{s.label}</span>
                          <span className={`career-paths_text-19 ${s.accent ? "career-paths_text-19--on" : ""}`.trim()}>{item[s.key]}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="career-paths_box-24">
                    <div className="career-paths_box-25">
                      <span className="career-paths_text-20">Tuition &amp; Investment</span>
                      <div className="career-paths_box-26">{item.tuition}</div>
                      <p className="career-paths_text-21">
                        <span className="career-paths_text-22 material-symbols-outlined">payments</span>
                        0% Installments via CIB &amp; Banque Misr
                      </p>
                    </div>
                    <Link to={item.pathUrl} className="career-paths_link-3">
                      <span>Explore Career Path</span>
                      <span className="career-paths_text-22 material-symbols-outlined">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(CareerPathsComponent);
