"use client";

import { useEffect, useState } from "react";

type Library = {
id: string;
name: string;
type: "movie" | "tv" | "collection";
itemType: string;
};

function getLibraryImage(type: string) {
switch (type) {
case "movie":
return "/library-movies.png";


case "tv":
  return "/library-tv.png";

case "collection":
  return "/library-collections.png";

default:
  return "/library-default.png";


}
}

export default function Home() {
const [libraries, setLibraries] = useState<Library[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
console.log("[LIBRARIES] Loading");


fetch("/api/libraries")
  .then((r) => r.json())
  .then((data) => {
    console.log("[LIBRARIES] Loaded", data);

    setLibraries(data.libraries || []);
  })
  .catch((err) => {
    console.error("[LIBRARIES] Failed", err);
  })
  .finally(() => {
    setLoading(false);
  });


}, []);

function selectLibrary(lib: Library) {
console.log("[LIBRARIES] Selected", lib);


localStorage.setItem(
  "activeLibraryId",
  lib.id
);

localStorage.setItem(
  "activeLibraryName",
  lib.name
);

localStorage.setItem(
  "activeLibraryType",
  lib.type
);

window.location.href =
  `/dashboard?libraryId=${lib.id}`;


}

return (
<div
style={{
minHeight: "100vh",
background: "#0b0b0f",
color: "#fff",
padding: 24,
fontFamily: "sans-serif",
}}
>
{/* HEADER */}
<div style={{ marginBottom: 30 }}>
<h1
style={{
fontSize: 32,
marginBottom: 8,
}}
>
Jellyfin Audit </h1>


    <p
      style={{
        opacity: 0.65,
        margin: 0,
      }}
    >
      Select a library to audit
    </p>
  </div>

  {loading ? (
    <div
      style={{
        opacity: 0.6,
      }}
    >
      Loading libraries...
    </div>
  ) : (
    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fill, minmax(280px, 1fr))",
        gap: 20,
      }}
    >
      {libraries.map((lib) => (
        <button
          key={lib.id}
          onClick={() => selectLibrary(lib)}
          style={{
            position: "relative",
            height: 180,
            overflow: "hidden",
            borderRadius: 12,
            border: "1px solid #222",
            cursor: "pointer",
            padding: 0,
            background: "#111",
            color: "#fff",
            textAlign: "left",
          }}
        >
          {/* BACKGROUND */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(${getLibraryImage(
                lib.type
              )})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter:
                "brightness(0.8) contrast(1.05)",
            }}
          />

          {/* OVERLAY */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.2))",
            }}
          />

          {/* CONTENT */}
          <div
            style={{
              position: "relative",
              padding: 16,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
            }}
          >
            <div
              style={{
                fontSize: 12,
                opacity: 0.7,
                textTransform: "uppercase",
                marginBottom: 4,
              }}
            >
              {lib.type}
            </div>

            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
              }}
            >
              {lib.name}
            </div>

            <div
              style={{
                marginTop: 8,
                fontSize: 12,
                opacity: 0.6,
              }}
            >
              Click to open dashboard
            </div>
          </div>
        </button>
      ))}
    </div>
  )}
</div>


);
}
