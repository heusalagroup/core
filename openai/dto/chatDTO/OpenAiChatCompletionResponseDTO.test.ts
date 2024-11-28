// Copyright (c) 2023. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import {
    createOpenAiChatCompletionResponseDTO,
    explainOpenAiChatCompletionResponseDTO,
    isOpenAiChatCompletionResponseDTO,
} from "./OpenAiChatCompletionResponseDTO";
import {OpenAiModel} from "../../types/OpenAiModel";
import {createOpenAiChatCompletionResponseChoice} from "./OpenAiChatCompletionResponseChoice";
import {createOpenAiChatCompletionMessage} from "./OpenAiChatCompletionMessage";
import {OpenAiUserType} from "../../types/OpenAiUserType";
import {createOpenAiCompletionResponseUsage} from "../OpenAiCompletionResponseUsage";

describe("OpenAiChatCompletionResponseDTO", () => {

    describe("createOpenAiChatCompletionResponseDTO", () => {

        it("creates valid OpenAiChatCompletionResponseDTO objects", () => {
            const result = createOpenAiChatCompletionResponseDTO(
                "1",
                "chat.completion",
                1677858242,
                OpenAiModel.GPT_3_5_TURBO_16K,
                [createOpenAiChatCompletionResponseChoice(
                    1,
                    createOpenAiChatCompletionMessage(
                        OpenAiUserType.USER,
                        "Hey, could you describe apple to me?"
                    ),
                    "stop",
                ),],
                createOpenAiCompletionResponseUsage(
                    200,
                    200,
                    500
                ),
                null
            );

            expect(result).toBeTruthy();
            expect(result).toStrictEqual(
                {
                    "choices": [
                        {
                            "finish_reason": "stop",
                            "index": 1,
                            "message": {
                                "content": "Hey, could you describe apple to me?",
                                "role": "user"
                            }
                        }
                    ],
                    "created": 1677858242,
                    "id": "1",
                    "model": "gpt-3.5-turbo-16k",
                    "object": "chat.completion",
                    "usage": {
                        "completion_tokens": 200,
                        "prompt_tokens": 200,
                        "total_tokens": 500
                    },
                    "system_fingerprint": null
                }
            )
        });

    });

    describe("isOpenAiChatCompletionResponseDTO", () => {

        it("returns true for valid OpenAiChatCompletionResponseDTO objects", () => {
            const item = {
                "choices": [
                    {
                        "finish_reason": "stop",
                        "index": 1,
                        "message": {
                            "content": "Hey, could you describe apple to me?",
                            "role": "user"
                        }
                    }
                ],
                "created": 1677858242,
                "id": "1",
                "model": "gpt-3.5-turbo-16k",
                "object": "chat.completion",
                "usage": {
                    "completion_tokens": 200,
                    "prompt_tokens": 200,
                    "total_tokens": 500
                },
                "system_fingerprint": null
            };

            expect(isOpenAiChatCompletionResponseDTO(item)).toBeTruthy();

        });

            it("returns true for valid OpenAiChatCompletionResponseDTO objects", () => {
                const item = {
                    "choices": [
                        {
                            "finish_reason": "stop",
                            "index": "1",
                            "message": {
                                "content": "Hey, could you describe apple to me?",
                                "role": "user"
                            }
                        }
                    ],
                    "created": 1677858242,
                    "id": "1",
                    "model": "gpt-3.5-turbo-16k",
                    "object": "chat.completion",
                    "usage": {
                        "completion_tokens": 200,
                        "prompt_tokens": 200,
                        "total_tokens": 500
                    },
                    "system_fingerprint": null
                };

                expect(isOpenAiChatCompletionResponseDTO(item)).toBe(false);
        });



    });

    describe("explainOpenAiChatCompletionResponseDTO", () => {

        it("returns a string explaining why the value is not a OpenAiChatCompletionResponseDTO", () => {
            const item = {
                "choices": [
                    {
                        "finish_reason": "stop",
                        "index": "1",
                        "message": {
                            "content": "Hey, could you describe apple to me?",
                            "role": "user"
                        }
                    }
                ],
                "created": [1677858242],
                "id": 1,
                "model": "gpt-3.5-turbo-16k",
                "object": "chat.completion",
                "usage": {
                    "completion_tokens": 200,
                    "prompt_tokens": 200,
                    "total_tokens": 500
                },
                "system_fingerprint": null
            };

        expect(explainOpenAiChatCompletionResponseDTO(item)).toBe(
            "property \"id\" not string, property \"created\" not number, property \"choices\" not OpenAiChatCompletionResponseChoice|OpenAiError: property \"index\" not number"
        );

        });


        it("returns a string explaining why the OpenAiChatCompletionResponseDTO has extra keys", () => {
            const item = {
                "choices": [
                    {
                        "finish_reason": "stop",
                        "index": "1",
                        "message": {
                            "content": "Hey, could you describe apple to me?",
                            "role": "user",
                            "extra": "just saying",
                        }
                    }
                ],
                "created": [1677858242],
                "id": 1,
                "model": "gpt-3.5-turbo-16k",
                "params" : ["some extra data"],
                "object": "chat.completion",
                "usage": {
                    "completion_tokens": 200,
                    "prompt_tokens": 200,
                    "total_tokens": 500
                },
                "system_fingerprint": null
            };

            expect(explainOpenAiChatCompletionResponseDTO(item)).toBe(
                "Value had extra properties: params, property \"id\" not string, property \"created\" not number, property \"choices\" not OpenAiChatCompletionResponseChoice|OpenAiError: property \"index\" not number, property \"message\" Value had extra properties: extra"
            );
        });


    });

});
