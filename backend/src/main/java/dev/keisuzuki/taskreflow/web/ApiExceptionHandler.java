package dev.keisuzuki.taskreflow.web;

import dev.keisuzuki.taskreflow.task.TaskNotFoundException;
import java.util.HashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * すべての @RestController で共通に使う例外処理．
 * 例外の種類ごとに，クライアントに返す HTTP ステータスと本文を決める．
 */
@RestControllerAdvice
public class ApiExceptionHandler {

    /**
     * 入力の検証に失敗したときの応答を組み立てる．
     * アノテーションの message 属性に書いた文をそのまま返すので，画面はこれを項目の下に出せる．
     *
     * @param e 失敗した項目と，その理由を保持している例外
     * @return 項目名 → エラーメッセージ の対応表．例 {"title": "タスク名を入力してください"}
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> handleValidationError(MethodArgumentNotValidException e) {
        Map<String, String> errors = new HashMap<>();
        for (FieldError error : e.getBindingResult().getFieldErrors()) {
            // 1つの項目で複数の制約が同時に失敗しうる．画面には1項目1行しか出せないので，先の1つだけ残す．
            errors.putIfAbsent(error.getField(), error.getDefaultMessage());
        }
        return errors;
    }

    /**
     * 存在しないタスクを指定されたときの応答を組み立てる．
     * 項目に紐づかないエラーなので，キーは項目名ではなく message 固定にする．
     *
     * @param e 見つからなかった ID をメッセージに含んでいる例外
     * @return {"message": "タスクが見つかりません（id = 99）"}
     */
    @ExceptionHandler(TaskNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public Map<String, String> handleTaskNotFound(TaskNotFoundException e) {
        return Map.of("message", e.getMessage());
    }
}
