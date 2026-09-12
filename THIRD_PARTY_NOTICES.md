# Third-party notices

QuickerBridge embeds and distributes PyCBA source code so that it can run inside
Pyodide in the browser. PyCBA is licensed under the GNU Affero General Public
License v3.0 or later. Its complete license text is preserved at
`vendor/pycba/LICENSE` and as `pycba-LICENSE.txt` inside the browser source bundle.

Vendored PyCBA provenance: upstream commit
`89fb9323433308739e2da9f51f9a1023a21bbd2d`, version 1.0.1. The local distribution
adds the CL-750-QC vehicle getter and its regression test, and accelerates
non-prismatic fixed-end-force integration in beam.py. See the two pycba-*.patch
files for these changes. No separate license is
asserted here for QuickerBridge; review the combined distribution obligations
before public release.

