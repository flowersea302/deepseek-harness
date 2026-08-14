# dsh-client-ui-question-navigator

`@deepseek-ai/dsh-client-ui-question-navigator` contributes a compact question-navigation rail to the Chat view.

Each ordinary user message produces one low-contrast horizontal marker at the transcript's right edge.
Hovering or focusing a marker exposes the question's first line, and selecting it scrolls to the corresponding Chat node.

Remove the `ui-question-navigator` row from the Web bundle patch or replace it in a later profile patch to disable the UI.

## Model Experience

This plugin does not add prompt text, tools, model input, token use, or KV-cache entries.
