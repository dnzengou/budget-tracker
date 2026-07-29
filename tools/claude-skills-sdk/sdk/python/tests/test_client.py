from claude_skills import Skills


def test_list_includes_all_six_skills():
    ids = set(Skills().list())
    assert {"arm", "rrss", "kafca", "kafcade", "devflow", "evolve"} <= ids


def test_get_returns_prompt_text():
    s = Skills().get("kafca")
    assert s.id == "kafca"
    assert "KafCa" in s.prompt


def test_compose_concatenates_with_separator():
    out = Skills().compose(["rrss", "kafca"])
    assert "RRSS" in out
    assert "KafCa" in out
    assert "---" in out
