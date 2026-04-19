(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var body = request.body.data;
    if (!body) {
        response.setStatus(400);
        return { error: "Missing JSON body" };
    }

    // Extract fields
    var workflowRunId = body.workflow_run_id;
    var state = body.state;
    var previousState = body.previous_state;
    var isTerminal = body.is_terminal;
    var lastUpdatedAt = body.last_updated_at;
    var rawPayload = body.raw_payload;

    if (!workflowRunId || !state) {
        response.setStatus(400);
        return { error: "workflow_run_id and state are required" };
    }

    // Lookup your record (example: table x_onboarding_request)
    var gr = new GlideRecord("x_yourcompany_onboarding_request");
    gr.addQuery("workflow_run_id", workflowRunId);
    gr.query();

    if (!gr.next()) {
        response.setStatus(404);
        return { error: "No matching onboarding request found" };
    }

    // Update fields
    gr.current_state = state;
    gr.previous_state = previousState;
    gr.is_terminal = isTerminal;
    gr.last_updated_at = lastUpdatedAt;
    gr.raw_payload = JSON.stringify(rawPayload);

    gr.update();

    // Respond back to GitHub
    return {
        result: "ok",
        workflow_run_id: workflowRunId,
        new_state: state,
        terminal: isTerminal
    };

})(request, response);