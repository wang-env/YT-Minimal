/** React y htm llegan como globales (scripts UMD de index.html). Este módulo los expone para el resto. */
export const {useState, useEffect, useRef, Fragment} = window.React;
export const html = window.htm.bind(window.React.createElement);
