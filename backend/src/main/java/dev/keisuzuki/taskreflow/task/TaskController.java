package dev.keisuzuki.taskreflow.task;

import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * タスクの作成と取得を受け付ける HTTP の窓口．
 */
@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    /**
     * 認証を入れるまでの暫定の所有者．
     * ログイン機能を足すときは，ここをログイン中のユーザーの ID に差し替える．
     */
    private static final long DEV_USER_ID = 1L;

    private final TaskRepository taskRepository;

    public TaskController(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    /**
     * 指定した日のタスクを並び順で返す．
     *
     * @param date yyyy-MM-dd 形式
     */
    @GetMapping
    public List<Task> list(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return taskRepository.findByDate(DEV_USER_ID, date);
    }

    /**
     * タスクを1件追加し，DB が確定させた値を含めて返す．
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Task create(@Valid @RequestBody TaskCreateRequest request) {
        return taskRepository.insert(DEV_USER_ID, request);
    }

    /**
     * タスクを1件書き換え，書き換えた後の値を返す．
     *
     * @throws TaskNotFoundException 指定した ID のタスクが無いとき
     */
    @PutMapping("/{id}")
    public Task update(@PathVariable long id, @Valid @RequestBody TaskUpdateRequest request) {
        return taskRepository.update(DEV_USER_ID, id, request)
                .orElseThrow(() -> new TaskNotFoundException(id));
    }

    /**
     * タスクを1件削除する．返す本文は無い．
     *
     * @throws TaskNotFoundException 指定した ID のタスクが無いとき
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable long id) {
        if (!taskRepository.delete(DEV_USER_ID, id)) {
            throw new TaskNotFoundException(id);
        }
    }
}
