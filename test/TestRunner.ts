// Copyright (c) 2022. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import {
    lstatSync,
    readdirSync
} from 'fs';
import {
    basename as pathBasename,
    dirname as pathDirname,
    join as pathJoin,
    resolve as pathResolve
} from 'path';
import { endsWith, forEach, isPromise, map, startsWith } from "../modules/lodash";
import { TestResultState } from "./types/TestResultState";
import { TestResult } from "./types/TestResult";
import { requireTypeScript } from "./requireTypeScript";

export class TestRunner {

    private static _testId : number = 0;
    private static _excludeDirectories : string[] = ['node_modules', '.git', '.svn'];
    private static _testFileEndingForJavaScript : string = 'Test.js';
    private static _testFileEndingForTypeScript : string = 'Test.ts';
    private static _testMethodEnding : string = 'Test';

    protected static _results : readonly TestResult[] = [];

    public static testFileInDir (dir: string, file: string) {

        if (startsWith(file, '.')) return;
        if (TestRunner._excludeDirectories.includes(file)) return;

        const stat = lstatSync(pathJoin(dir, file));
        const isDir = stat.isDirectory();

        if (isDir) {
            return TestRunner.testDirectory(pathJoin(dir, file));
        }

        const isJavaScriptFile = endsWith(file, TestRunner._testFileEndingForJavaScript);
        const isTypeScriptFile = endsWith(file, TestRunner._testFileEndingForTypeScript);

        if ( isJavaScriptFile || isTypeScriptFile ) {
            const resolvedPath = pathResolve(dir, file);
            const test = isJavaScriptFile ? require(resolvedPath) : requireTypeScript(resolvedPath);
            const testNames : string[] = Object.keys(test).filter(file => endsWith(file, TestRunner._testMethodEnding));
            forEach(testNames, (testName : string) => {
                const testClassName   = testName;
                const testClass       = test[testClassName];
                const testMethodNames : string[] = Object.keys(testClass);
                forEach(testMethodNames, (methodName: string) => {

                    TestRunner._testId += 1;
                    const id = `${TestRunner._testId}`;
                    const resolvedFile = pathResolve(dir, file);

                    let testResult : TestResult = {
                        id,
                        state: TestResultState.RUNNING,
                        file: resolvedFile,
                        className: testClassName,
                        methodName: methodName
                    };

                    TestRunner._results = [
                        ...TestRunner._results,
                        testResult
                    ];

                    function updateTestResult (newResult: TestResult) {
                        TestRunner._results = map(
                            TestRunner._results,
                            (item: TestResult) : TestResult => {
                                if (item.id === newResult.id) {
                                    return newResult;
                                } else {
                                    return item;
                                }
                            }
                        );
                    }

                    function testSuccess () {
                        updateTestResult({
                            ...testResult,
                            state: TestResultState.SUCCESS
                        });
                    }

                    function testFailed (err : any) {
                        updateTestResult({
                            ...testResult,
                            state: TestResultState.FAILED,
                            result: err
                        });
                    }

                    try {
                        const result = testClass[methodName]();
                        if (isPromise(result)) {
                            updateTestResult({
                                ...testResult,
                                promise: result
                            });
                            result.then(testSuccess, testFailed);
                        } else {
                            testSuccess();
                        }
                    } catch(err) {
                        testFailed(err);
                    }

                });
            });
        }

    }

    public static testFile (file : string) {
        TestRunner.testFileInDir( pathDirname(file), pathBasename(file) );
    }

    public static testDirectory (dir : string) {
        forEach(readdirSync(dir), TestRunner.testFileInDir.bind(undefined, dir) );
    }

    public static printResults () {

        const results = TestRunner._results;

        let testCount = results.length;
        let runningCount = 0;
        let successCount = 0;
        let failedCount = 0;
        let errorResults : TestResult[] = []
        let promises : Promise<any>[] = [];

        forEach(results, (result : TestResult) => {
            switch(result.state) {
                case TestResultState.RUNNING:
                    runningCount += 1;
                    promises.push(result.promise);
                    return;
                case TestResultState.SUCCESS:
                    successCount += 1;
                    return;
                case TestResultState.FAILED:
                    failedCount += 1;
                    errorResults.push(result);
                    return;
            }
        });

        if (promises.length) {
            Promise.allSettled(promises).then(TestRunner.printResults).catch(err => {
                console.error('ERROR: ', err);
                process.exit(1);
            });
            return;
        }

        if (testCount === 0) {
            console.error(`ERROR: No tests found.`);
            process.exit(1);
            return;
        }

        if (failedCount >= 1) {
            console.error(`ERROR: ${failedCount} (of ${testCount}) tests failed:\n`);
            forEach(errorResults, (testResult : TestResult) => {
                console.error(`[${testResult.file}] ${testResult.className}.${testResult.methodName} failed: `, testResult.result, '\n');
            });
            process.exit(1);
            return;
        }

        console.log(`All ${testCount} tests successfully executed.`);

    }

}

