# Non-prismatic girders: depth, plates and EI

QuickerBridge v0.4 · Research checked 2026-09-12

## What the controls mean

**Constant / Linear depth / Parabolic depth** describe the actual overall girder
height, including both flanges. They are not CSI's EI interpolation controls.
The start section supplies the initial height and the end section the target
height. The zone option **Plates, E and M from** selects which section supplies the
flange widths and thicknesses, web thickness, E and inertia modifier:

- **Start** (default, v0.4 behaviour): the start section's plates.
- **End**: the end (target) section's plates.
- **Deeper**: the plates of the deeper of the two sections (start on a tie).

Deeper is invariant when the start and end sections are swapped, so a haunch drawn
S1→S2 before a pier and S2→S1 after it is an exact mirror. With Start, the swap also
swaps the plates and the bridge becomes asymmetric. To change plates, begin a new
zone. Plate dimensions change abruptly there. No plate dimension or E is blended.

For normalized position t from 0 to 1:

- Constant: h(t) = h0.
- Linear: h(t) = h0 + (h1 − h0)t.
- Parabolic, shallow to deep: h(t) = h0 + (h1 − h0)t².
- Parabolic, deep to shallow: h(t) = h0 + (h1 − h0)[1 − (1 − t)²].

The last two are mirrored and tangent at the shallow end. At a plate-thickness
step, overall depth may be continuous while clear web height changes; enter the
actual overall depths at each zone end. The drawing is a schematic depth outline,
not a fabrication drawing of each flange plate.

## Why CSI says “parabolic” for a linear I-girder taper

CSI varies EI itself for its linear option, the square root of EI for its
parabolic option, and the cube root of EI for its cubic option. In compact form,
EI(t) = [(1−t) EI0^(1/p) + t EI1^(1/p)]^p, with p = 1, 2 or 3.
CSI associates linear I-shape depth variation with its parabolic stiffness option;
it associates linear rectangular depth variation with cubic stiffness.
[CSiBridge nonprismatic sections](https://docs.csiamerica.com/help-files/csibridge/Components_tab/Properties_Type_panel/Frame_Sections/Nonprismatic.htm).

For an I-girder, the flange contribution to strong-axis inertia is approximately
proportional to the square of flange separation. Thus a straight depth taper
often has approximately quadratic EI. This is an approximation: the web adds a
cubic depth term and unequal flanges move the centroid. QuickerBridge uses the
three-rectangle parallel-axis calculation instead of imposing an EI power law.

With fixed plate dimensions and homogeneous E:

| Actual depth | Approximate flange-dominated I | QuickerBridge |
| --- | --- | --- |
| Linear | Quadratic in position | Calculate I from actual geometry |
| Parabolic | Up to fourth order | Calculate I from actual geometry |
| Cubic | Up to sixth order | Not a current input option |

These orders are explanatory approximations, not exact interpolation rules for
asymmetric sections. A cubic depth function also needs slopes or other shape
constraints: two end depths alone do not determine a unique cubic. CSI's cubic
EI option therefore cannot stand in for an unspecified cubic girder shape.

## What is used in bridge fabrication?

AASHTO/NSBA G12.1-2020 §2.2.3 allows straight or parabolic haunches. Its commentary
describes parabolic transitions as visually smooth near contraflexure and explains
that modern fabrication can involve similar effort for either shape. This source
does not establish cubic haunches as the usual choice or give prevalence statistics.
[Guidelines to Design for Constructability and Fabrication](https://www.aisc.org/media/f5oop4mb/g121-2020-guidelines-to-design-for-constructability.pdf).

Use the geometry specified for the actual bridge. The app retains both straight
and explicitly defined parabolic depth profiles; it does not infer one from the
word “variable” or from moment sign.

## Section calculation and modifier

The web clear height is h − t_top − t_bottom. The three non-overlapping rectangles
give A = ΣA_i, ȳ = Σ(A_i y_i)/A, and I_steel = Σ[I_i + A_i(y_i−ȳ)²].
Dimensions in mm are converted to metres. With E in GPa:

**EI [kN·m²] = E × 10⁶ × I_steel [m⁴] × M.**

M is an explicit effective-stiffness assumption, uniform within each zone.
M = 4 quadruples EI. It does not calculate a transformed concrete slab, effective
width, creep, cracking, stresses, section resistance or composite neutral axis.
The displayed I, area and centroid remain gross steel properties. Direct constant
EI sections already contain their effective stiffness and bypass this modifier.

EI is sampled at 33 points per tapered zone (65 in Fine mode), with positive
linear interpolation between samples. True zone jumps are retained. The solver
therefore approximates the exact geometric EI between sampling points; compare
Standard and Fine for sensitivity. Refining the report table does not refine EI.

## Earlier project files

Schema 2 records v0.4 depth-only semantics. Schema 1 files open automatically when
this preserves their meaning. If an older active taper changed plate dimensions
or E continuously, opening is refused with an explanatory message. Keep v0.3 to
inspect that original model, then explicitly redefine its zones in v0.4.
