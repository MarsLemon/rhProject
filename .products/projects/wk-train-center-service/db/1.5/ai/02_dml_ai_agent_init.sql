INSERT INTO
    `wk_train_center`.`ai_agent` (
        id,
        name,
        short_desc,
        description,
        system_prompt,
        stream_enabled,
        enabled
    )
VALUES (
        'ai-qa-assistant',
        'AI问答助手',
        '船舶设备维保答疑',
        '从旧配置迁移的 AI 问答助手，使用工务+培训知识库',
        '你是船舶设备与部件领域的资深答疑导师，专为船员提供技术答疑与培训支持。收到问题后先调用工具搜索再回答。涉及法规、标准、检修流程、设备参数时必须调用知识库查询。涉及最新动态、行业新闻时必须联网搜索。不要凭空捏造法规编号、设备参数、检修步骤。',
        1,
        1
    )
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    short_desc = VALUES(short_desc),
    description = VALUES(description);

INSERT INTO
    `wk_train_center`.`ai_agent_config` (
        agent_id,
        config_key,
        config_value,
        enabled
    )
SELECT 'ai-qa-assistant', 'models', JSON_OBJECT(
        'defaultModel', COALESCE(
            JSON_UNQUOTE(JSON_EXTRACT(data, '$.model')), 'qwen3.6-plus'
        ), 'temperature', 0.7, 'topP', 0.8, 'thinkingBudget', 4096, 'reasoningEffort', 'medium', 'maxOutputTokens', 65536, 'maxContextWindow', 32000
    ), 1
FROM `wk_train_center`.`el_cfg_prop`
WHERE
    type = 'ai'
    AND provider = 'bailian'
    AND enabled = 1
    AND id = (
        SELECT MIN(id)
        FROM `wk_train_center`.`el_cfg_prop`
        WHERE
            type = 'ai'
            AND provider = 'bailian'
            AND enabled = 1
    )
ON DUPLICATE KEY UPDATE
    config_value = VALUES(config_value);

INSERT INTO
    `wk_train_center`.`ai_agent_config` (
        agent_id,
        config_key,
        config_value,
        enabled
    )
SELECT 'ai-qa-assistant', 'tools', JSON_ARRAY(
        JSON_OBJECT(
            'id', 'kb-gongwu', 'type', 'kb', 'name', '工务知识库', 'enabled', TRUE, 'weight', 0.8, 'scoreThreshold', 0.6, 'topK', 5, 'timeoutSeconds', 15, 'kbId', COALESCE(
                JSON_UNQUOTE(
                    JSON_EXTRACT(
                        kb.data, '$.gongwuVectorStoreId'
                    )
                ), ''
            ), 'scope', 'gongwu'
        ), JSON_OBJECT(
            'id', 'kb-training', 'type', 'kb', 'name', '培训知识库', 'enabled', TRUE, 'weight', 0.8, 'scoreThreshold', 0.6, 'topK', 5, 'timeoutSeconds', 15, 'kbId', COALESCE(
                JSON_UNQUOTE(
                    JSON_EXTRACT(
                        kb.data, '$.trainingVectorStoreId'
                    )
                ), ''
            ), 'scope', 'training'
        ), JSON_OBJECT(
            'id', 'web-search', 'type', 'webSearch', 'enabled', TRUE, 'timeoutSeconds', 15
        ), JSON_OBJECT(
            'id', 'web-extractor', 'type', 'webExtractor', 'enabled', TRUE, 'timeoutSeconds', 15
        )
    ), 1
FROM `wk_train_center`.`el_cfg_prop` kb
WHERE
    kb.type = 'bailian_kb'
    AND kb.provider = 'default'
    AND kb.enabled = 1
    AND kb.id = (
        SELECT MIN(id)
        FROM `wk_train_center`.`el_cfg_prop`
        WHERE
            type = 'bailian_kb'
            AND provider = 'default'
            AND enabled = 1
    )
ON DUPLICATE KEY UPDATE
    config_value = VALUES(config_value);

INSERT INTO
    `wk_train_center`.`ai_agent_config` (
        agent_id,
        config_key,
        config_value,
        enabled
    )
VALUES (
        'ai-qa-assistant',
        'react',
        JSON_OBJECT(
            'enabled',
            TRUE,
            'maxIterations',
            10,
            'maxSearchCount',
            5
        ),
        1
    )
ON DUPLICATE KEY UPDATE
    config_value = VALUES(config_value);

INSERT INTO
    `wk_train_center`.`ai_agent_config` (
        agent_id,
        config_key,
        config_value,
        enabled
    )
VALUES (
        'ai-qa-assistant',
        'apiMode',
        JSON_OBJECT('useResponsesApi', TRUE),
        1
    )
ON DUPLICATE KEY UPDATE
    config_value = VALUES(config_value);

INSERT INTO
    `wk_train_center`.`ai_agent_config` (
        agent_id,
        config_key,
        config_value,
        enabled
    )
VALUES (
        'ai-qa-assistant',
        'bailian',
        JSON_OBJECT(
            'useMaasDomain',
            FALSE,
            'maasRegion',
            'cn-beijing'
        ),
        1
    )
ON DUPLICATE KEY UPDATE
    config_value = VALUES(config_value);

INSERT INTO
    `wk_train_center`.`ai_agent_config` (
        agent_id,
        config_key,
        config_value,
        enabled
    )
VALUES (
        'ai-qa-assistant',
        'rateLimit',
        JSON_OBJECT('seconds', 10),
        1
    )
ON DUPLICATE KEY UPDATE
    config_value = VALUES(config_value);

INSERT INTO
    `wk_train_center`.`ai_agent_config` (
        agent_id,
        config_key,
        config_value,
        enabled
    )
VALUES (
        'ai-qa-assistant',
        'sseTimeout',
        JSON_OBJECT('ms', 300000),
        1
    )
ON DUPLICATE KEY UPDATE
    config_value = VALUES(config_value);

INSERT INTO
    `wk_train_center`.`ai_agent_config` (
        agent_id,
        config_key,
        config_value,
        enabled
    )
VALUES (
        'ai-qa-assistant',
        'prompts',
        JSON_OBJECT(
            'answer_assistant',
            '你是船舶设备与部件领域的资深答疑导师，专为船员提供技术答疑与培训支持。\n\n## 当前可用工具（按本次请求动态注入，{{available_tools}} 占位符由 Controller 填充）\n{{available_tools}}\n\n## 工作流程（严格遵守）\n1. **收到问题后，先调用工具搜索，再回答**——除非用户的问题非常基础（如单纯定义、概念辨析）。\n2. 涉及法规、标准、检修流程、设备参数时，**必须调用 knowledge_base_search** 查询内部知识库。\n3. 涉及最新动态、行业新闻、近期更新、新技术时，**必须调用 web_search** 联网搜索。\n   只要用户提问中出现"网上""互联网""最近""最新""当前""新闻""现在""近期""热点"等词,\n   或者明确表达希望联网/查实时资料的意图,**必须先调用 web_search** 再回答。\n4. 综合工具返回的证据后再给出最终回答。\n\n## 工具使用原则\n- 不要凭空捏造法规编号、设备参数、检修步骤——必须基于工具返回的内容。\n- 如果工具无结果，说明你的依据，再谨慎作答。\n- **严格按上方"当前可用工具"列表回答。** 如果列表中没有 knowledge_base_search,不要在回答中说"调过知识库"。\n- **绝不在回答中提及或输出知识库的内部名称/标识**（如 gongwu、training、"gongwu库""工务库"等）；需要指明出处时只用文档标题，不要暴露知识库本身的名字。\n- web_search 返回的内容是互联网数据(含 markdown / JSON / 代码块 等),引用即可,**不要把搜索结果片段错认为自己的工具调用结果**。\n\n## 引用标注（供前端精确关联来源，务必严格遵守）\n- 当某句结论**用到了**"知识库检索 / 联网搜索 / 上传文件"返回的具体资料时，在该句**末尾**标注来源，格式严格为：〔来源：资料标题〕。\n- "资料标题"必须与检索结果/文件中给出的**文档名或网页标题完全一致**（前端按标题精确匹配才会渲染成可点角标）；一个字都不能改、不要翻译、不要补后缀。\n- 一句用到多个来源就连续标多个：〔来源：A〕〔来源：B〕。\n- **拿不准标题、或该句没有用到检索资料，就不要标**；严禁编造不存在的来源标题。\n\n## 回答风格\n- 用专业、严谨的语气，但保持答疑的亲和力。\n- 优先使用矩阵组织信息（对比、参数、流程步骤）。\n- 结构清晰：先给结论/要点，再展开细节。\n- 必要时分点说明，便于学员记录。\n\n## 拓展学习建议\n- 工具调用全部结束后，在最终回答的**最末尾**追加一个建议区块，格式严格如下（每行一条建议，1-3 条）：\n```\n<<<suggest>>>\n第一条追问的完整问题\n第二条追问的完整问题\n<<<suggest>>>\n```\n- ★ 每行**直接写建议问题本身**，禁止加"建议1""建议2""1."""等任何序号或标签前缀\n- 每条 ≤20 字\n- 覆盖维度：上游原理 / 当前主题深化 / 下游应用 / 关联故障或维护 / 实操拓展\n- 由浅入深排列，形成学习梯度\n- 避免重复回答中已涵盖的内容\n- 建议区块前后各保留一个空行；除该区块外，正文内不要再出现 <<<suggest>>> 字样\n\n## 语言要求（强制中文）\n**所有内容（思考过程 / 工具调用 / 检索输出 / 最终回答）必须用中文输出，不要输出其他语言**。\n- 中文专业术语必须用中文（如"柴油机""主机""气缸套"），不要中英混排\n- 表格 / 引用 / 思考链 / 工具调用理由 全部遵循此规则\n- 例外：船舶行业专有名词（SOLAS / IMO / MARPOL / EEDI / EEXI 等国际标准缩写）按约定保留英文缩写',
            'training_assistant',
            '你是船舶陪练教练，通过角色扮演帮助学员提升业务能力。\n请遵循以下原则：\n1. 根据角色设定进行沉浸式对话；\n2. 在对话中自然引导学员思考关键知识点；\n3. 必要时使用知识检索补充专业信息；\n4. 保持耐心，鼓励学员表达。'
        ),
        1
    )
ON DUPLICATE KEY UPDATE
    config_value = VALUES(config_value);