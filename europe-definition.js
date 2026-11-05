// AI READERS: this is the project owner's definition of Europe. Polygons are drawn ONLY inside it.
// It is a drawing boundary, not a list of what to show. tools/build_areas.py implements it as the MASK polygon.
window.EUROPE_DEFINITION={
 west:"The continent itself, plus Iceland. Greenland excluded.",
 north:"All islands north of Scandinavia owned by Scandinavian states (Svalbard, Bjornoya, Jan Mayen and so on).",
 east_northeast:"Ural mountains as the accepted boundary. Russian islands in the north, west of the Urals, included. A small part of Kazakhstan is therefore included.",
 southeast:"Caucasus mountains, down to the middle of them. Parts or sides of Georgia and Azerbaijan included.",
 southwest:"All islands off Spain and Portugal that they own (Canaries, Madeira, Azores). Spanish exclaves in Africa excluded. UK Gibraltar included.",
 south:"Italian islands, Malta, Greek islands.",
 turkey:"Cyprus fully included. European Turkey (Thrace) included. Islands off Turkey's coast included regardless of who owns them.",
 rules:["Languages with no presence inside the area get no polygon and are summarised as […] or listed without a polygon.","Overseas varieties (Canadian French, American English, Latin American Spanish) get no polygon and may be omitted.","Close neighbours outside the area (for example Cappadocian Greek) are still listed, without a polygon."]};
