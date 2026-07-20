from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel, Field
from typing import Optional
from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────────────────────────────────────
# REQUEST MODELS
# ─────────────────────────────────────────────────────────────────────────────

class ReactionRequest(BaseModel):
    reactants: list[str]


class CraftRequest(BaseModel):
    elements: list[str]          # e.g. ["H", "O"]  or  ["Na", "Cl"]
    attempted_formula: str       # what the student tried to build, e.g. "H2O"


# ─────────────────────────────────────────────────────────────────────────────
# RESPONSE MODELS
# ─────────────────────────────────────────────────────────────────────────────


class CompoundProperties(BaseModel):
    molar_mass: str = Field(description="Molar mass with units, e.g. '18.015 g/mol'")
    state_at_room_temp: str = Field(description="Physical state at room temperature: solid, liquid, or gas")
    color: str = Field(description="Color or appearance of the compound, e.g. 'colorless liquid'")
    melting_point: str = Field(description="Melting point with units, e.g. '0 degC'")
    boiling_point: str = Field(description="Boiling point with units, e.g. '100 degC'")
    solubility: str = Field(description="Solubility description, e.g. 'Miscible with water'")
    ph: Optional[str] = Field(None, description="pH value or range if applicable, e.g. '7 (neutral)'")


class CompoundInfo(BaseModel):
    success: bool = Field(description="True if a valid compound can be formed, False otherwise.")
    compound_name: str = Field(description="IUPAC or common name of the compound, or empty string on failure.")
    formula: str = Field(description="Chemical formula of the compound, or empty string on failure.")
    balanced_equation: str = Field(
        description="Balanced formation equation, e.g. '2H2 + O2 -> 2H2O', or empty string on failure."
    )
    bond_type: str = Field(
        description="Type of chemical bond formed (ionic, covalent, metallic, etc.), or empty string on failure."
    )
    fun_fact: str = Field(
        description="One fascinating real-world fun fact about the compound, or empty string on failure."
    )
    real_world_uses: list[str] = Field(
        description=(
            "List of 3-4 real-world uses/applications of this compound. "
            "Return an empty list on failure."
        )
    )
    properties: Optional[CompoundProperties] = Field(
        None,
        description="Key physical and chemical properties of the compound. None on failure."
    )
    safety_info: str = Field(
        description="Brief safety information or hazard note for the compound, or empty string on failure."
    )
    failure_reason: str = Field(
        description=(
            "If success is False, explain clearly WHY these elements cannot form a stable compound "
            "in simple educational language suitable for a student. Empty string on success."
        )
    )


# ─────────────────────────────────────────────────────────────────────────────
# ENDPOINTS
# ─────────────────────────────────────────────────────────────────────────────

@app.post("/craft_compound", response_model=CompoundInfo)
def craft_compound(request: CraftRequest):
    """
    Given a set of elements the student combined in the Compound Crafter,
    determine whether a real compound can be formed and return rich educational data.
    If no valid compound exists, explain why in student-friendly language.
    """
    model = ChatGroq(model="llama-3.1-8b-instant", temperature=0.3)
    llm = model.with_structured_output(CompoundInfo)

    element_list = ", ".join(request.elements)

    prompt = ChatPromptTemplate.from_messages([
        (
            "system",
            """You are an expert chemistry educator helping students learn through a virtual lab.
A student combined elements in a crafting beaker and pressed 'Craft Compound'.

Your job:
1. Determine if these elements can combine to form a real, stable, well-known compound.
2. If YES: set success=True and fill in ALL fields with accurate, educational data.
   - compound_name: the compound's common or IUPAC name
   - formula: its chemical formula (e.g. H2O, NaCl)
   - balanced_equation: balanced formation equation using text notation (e.g. 2H2 + O2 -> 2H2O)
   - bond_type: e.g. covalent, ionic, polar covalent
   - fun_fact: one fascinating real-world fact a student would find interesting
   - real_world_uses: 3-4 practical applications
   - properties: physical/chemical properties (molar_mass, state_at_room_temp, color, melting_point, boiling_point, solubility, ph)
   - safety_info: a brief hazard or safety note
   - failure_reason: empty string ""
3. If NO: set success=False, leave compound_name/formula/balanced_equation/bond_type/fun_fact/safety_info as empty strings "",
   real_world_uses as [], properties as null, and write a clear student-friendly failure_reason
   explaining why these elements don't form a stable compound.

Be accurate, concise, and educational. Use simple language suitable for high-school students."""
        ),
        (
            "human",
            "The student combined these elements: {elements}\nAttempted formula hint: {formula}"
        ),
    ])

    chain = prompt | llm
    response = chain.invoke({
        "elements": element_list,
        "formula": request.attempted_formula,
    })

    return response


# ─────────────────────────────────────────────────────────────────────────────
# FREE LAB — react any substances the student puts in the beaker
# ─────────────────────────────────────────────────────────────────────────────

class FreeReactRequest(BaseModel):
    reactants: list[str]       # labels / formulas, e.g. ["H2", "O2"] or ["Na", "Cl2"]


class FreeReactionResult(BaseModel):
    has_reaction: bool = Field(
        description="True if a real chemical reaction occurs, False if substances merely mix/dissolve."
    )
    reaction_name: str = Field(
        description="Short descriptive name of the reaction, e.g. 'Synthesis of Water'. Empty string if no reaction."
    )
    balanced_equation: str = Field(
        description="Balanced chemical equation using text notation, e.g. '2H2 + O2 -> 2H2O'. Empty string if no reaction."
    )
    products: list[str] = Field(
        description="List of product names, e.g. ['Water (H2O)']. Empty list if no reaction."
    )
    what_happens: str = Field(
        description=(
            "A vivid, student-friendly description of what a student would OBSERVE in the lab: "
            "colour changes, gas bubbles, precipitates, flames, heat/light, smells, etc. "
            "If no reaction, describe what physically happens (e.g. dissolves, mixes, remains unchanged)."
        )
    )
    energy_type: str = Field(
        description="One of: 'Exothermic', 'Endothermic', 'No Reaction', or 'Physical Change'."
    )
    reaction_type: str = Field(
        description=(
            "Type of reaction if applicable: 'Combination', 'Decomposition', 'Single Displacement', "
            "'Double Displacement', 'Combustion', 'Acid-Base', 'Redox', 'Physical Change', 'No Reaction'."
        )
    )
    fun_fact: str = Field(
        description="One fascinating real-world application or fact about this reaction. Empty string if no reaction."
    )
    safety_info: str = Field(
        description="Important safety notes — hazards, handling precautions, or 'Safe under normal conditions'."
    )
    no_reaction_reason: str = Field(
        description=(
            "If has_reaction is False, explain clearly in simple language WHY no chemical reaction occurs. "
            "Empty string if a reaction does occur."
        )
    )


@app.post("/free_react", response_model=FreeReactionResult)
def free_react(request: FreeReactRequest):
    """
    Free Lab endpoint: given any set of substances the student added to the beaker,
    determine what reaction (if any) would occur and return rich observational + educational data.
    """
    model = ChatGroq(model="llama-3.3-70b-versatile", temperature=0.4)
    llm   = model.with_structured_output(FreeReactionResult)

    reactant_list = ", ".join(request.reactants)

    prompt = ChatPromptTemplate.from_messages([
        (
            "system",
            """You are an expert chemistry educator for a virtual lab used by high-school students.
A student placed substances into a Free Lab beaker and wants to know what happens.

Your job:
1. Determine if a REAL CHEMICAL REACTION occurs between these substances.
2. If YES (has_reaction=True):
   - reaction_name: short descriptive name
   - balanced_equation: balanced equation in text form (e.g. 2H2 + O2 -> 2H2O)
   - products: list of product names with formulas
   - what_happens: describe what the student would OBSERVE (colour, gas, heat, light, precipitate, etc.)
   - energy_type: 'Exothermic' or 'Endothermic'
   - reaction_type: the category (Combination, Decomposition, etc.)
   - fun_fact: one real-world application
   - safety_info: hazard notes
   - no_reaction_reason: empty string ""
3. If NO chemical reaction (has_reaction=False):
   - Describe the physical change (dissolves, mixes, remains unchanged) in what_happens
   - energy_type: 'No Reaction' or 'Physical Change'
   - no_reaction_reason: explain WHY in student-friendly language
   - Leave reaction_name, balanced_equation, products, fun_fact as empty / []

Be accurate and vivid. Prioritise observable phenomena that make chemistry feel real and exciting.
Use simple language suitable for high-school students."""
        ),
        (
            "human",
            "The student placed these substances in the Free Lab beaker: {reactants}"
        ),
    ])

    chain    = prompt | llm
    response = chain.invoke({"reactants": reactant_list})
    return response
