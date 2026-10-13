package dev.keisuzuki.taskreflow.task;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
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
     * 指定したユーザーの，指定した日のタスクを並び順で返す．
     *
     * @return 0件なら空のリスト（null は返さない）
     */
    public List<Task> findByDate(long userId, LocalDate date) {
        return jdbcClient.sql("""
                SELECT id, user_id, title, description, position, minutes,
                       scheduled_date, status, created_at
                  FROM tasks
                 WHERE user_id = :userId AND scheduled_date = :date
                 ORDER BY position, id
                """)
                .param("userId", userId)
                .param("date", date)
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
}
