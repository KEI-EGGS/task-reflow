package dev.keisuzuki.taskreflow.task;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

/**
 * tasks テーブルへの読み書き．SQL を書くのはこのクラスだけに閉じる．
 */
@Repository
public class TaskRepository {

    /** ResultSet の1行を Task に移す．列名は tasks テーブルの定義と一致させる． */
    private static final RowMapper<Task> TASK_MAPPER = (rs, rowNum) -> new Task(
            rs.getLong("id"),
            rs.getLong("user_id"),
            rs.getString("title"),
            rs.getString("description"),
            rs.getInt("position"),
            rs.getInt("minutes"),
            rs.getObject("scheduled_date", LocalDate.class),
            TaskStatus.from(rs.getString("status")),
            rs.getObject("created_at", LocalDateTime.class));

    private final JdbcClient jdbcClient;

    public TaskRepository(JdbcClient jdbcClient) {
        this.jdbcClient = jdbcClient;
    }

    /**
     * 指定したユーザーの，指定した期間のタスクを日付・並び順で返す．
     * from と to は両端を含む．1日だけ欲しいときは同じ日付を渡す．
     *
     * @return 0件なら空のリスト（null は返さない）
     */
    public List<Task> findByDateRange(long userId, LocalDate from, LocalDate to) {
        return jdbcClient.sql("""
                SELECT id, user_id, title, description, position, minutes,
                       scheduled_date, status, created_at
                  FROM tasks
                 WHERE user_id = :userId
                   AND scheduled_date BETWEEN :from AND :to
                 ORDER BY scheduled_date, position, id
                """)
                .param("userId", userId)
                .param("from", from)
                .param("to", to)
                .query(TASK_MAPPER)
                .list();
    }

    /**
     * タスクを1件追加し，DB が確定させた値を含めて返す．
     * position は同じユーザー・同じ日の末尾に採番する．
     */
    public Task insert(long userId, TaskCreateRequest request) {
        return jdbcClient.sql("""
                INSERT INTO tasks (user_id, title, description, position, minutes, scheduled_date)
                VALUES (:userId, :title, :description,
                        (SELECT COALESCE(MAX(position), 0) + 1
                           FROM tasks
                          WHERE user_id = :userId AND scheduled_date = :date),
                        :minutes, :date)
                RETURNING id, user_id, title, description, position, minutes,
                          scheduled_date, status, created_at
                """)
                .param("userId", userId)
                .param("title", request.title())
                .param("description", request.description())
                .param("minutes", request.minutes())
                .param("date", request.scheduledDate())
                .query(TASK_MAPPER)
                .single();
    }

    /**
     * タスクを1件書き換え，書き換えた後の値を返す．
     * 他人のタスクを書き換えられないよう，id だけでなく user_id でも絞る．
     *
     * @return 書き換えた後のタスク．該当する行が無ければ空
     */
    public Optional<Task> update(long userId, long id, TaskUpdateRequest request) {
        return jdbcClient.sql("""
                UPDATE tasks
                   SET title = :title, description = :description,
                       minutes = :minutes, status = :status
                 WHERE id = :id AND user_id = :userId
                RETURNING id, user_id, title, description, position, minutes,
                          scheduled_date, status, created_at
                """)
                .param("title", request.title())
                .param("description", request.description())
                .param("minutes", request.minutes())
                .param("status", request.status().value())
                .param("id", id)
                .param("userId", userId)
                .query(TASK_MAPPER)
                .optional();
    }

    /**
     * タスクを1件削除する．
     * 他人のタスクを消せないよう，id だけでなく user_id でも絞る．
     *
     * @return 削除できたら true．該当する行が無ければ false
     */
    public boolean delete(long userId, long id) {
        int rows = jdbcClient.sql("""
                DELETE FROM tasks
                 WHERE id = :id AND user_id = :userId
                """)
                .param("id", id)
                .param("userId", userId)
                .update();
        return rows == 1;
    }
}
