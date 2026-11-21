// oxlint JS plugin: oxlint 기본 규칙으로 표현할 수 없는 Unplan 전용 규칙입니다.
// 설정: .oxlintrc.json의 jsPlugins

const COLOR_LITERAL = /^(#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})|(?:rgba?|hsla?)\()/i;

const noColorLiterals = {
  meta: {
    type: 'suggestion',
    docs: {
      description: '색상 리터럴 대신 src/constants의 colors 토큰을 사용합니다.',
    },
    messages: {
      useToken:
        "색상 리터럴 '{{ value }}' 대신 colors 토큰을 사용하세요. 토큰이 없으면 src/constants에 먼저 추가합니다.",
    },
    schema: [],
  },
  create(context) {
    return {
      Literal(node) {
        if (typeof node.value === 'string' && COLOR_LITERAL.test(node.value)) {
          context.report({ node, messageId: 'useToken', data: { value: node.value } });
        }
      },
    };
  },
};

export default {
  meta: { name: 'unplan' },
  rules: {
    'no-color-literals': noColorLiterals,
  },
};
